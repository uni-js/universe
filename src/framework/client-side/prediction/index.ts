import { EventEmitter2 } from 'eventemitter2';
import { SERVER_TICKS_MULTIPLE } from '../../../server/shared/server';

export class EntityState {
	x: number;
	y: number;
	motionX: number;
	motionY: number;
}

export class Input {
	moveX: number;
	moveY: number;
	seqId?: number;
}

export class AckData {
	x: number;
	y: number;
	motionX: number;
	motionY: number;
	lastProcessedInput: number;
}

/**
 * support client-side prediction and server reconciliation
 */
export class PredictedInputManager extends EventEmitter2 {
	private state: EntityState;
	private inputSequenceCount = 0;
	private pendingInputs: Input[] = [];

	constructor(initState: EntityState) {
		super();
		this.state = initState;
	}

	private applyInput(input: Input) {
		this.state.x += input.moveX;
		this.state.y += input.moveY;
		this.emit('applyState', this.state);
	}

	private applyState(state: EntityState) {
		this.state = state;
		this.emit('applyState', this.state);
	}

	pendInput(input: Input) {
		const bufferedInput = {
			...input,
			seqId: this.inputSequenceCount,
		};

		this.applyInput(bufferedInput);
		this.pendingInputs.push(bufferedInput);
		this.inputSequenceCount += 1;

		this.emit('applyInput', bufferedInput);
		return bufferedInput;
	}

	/**
	 * acknowledge the input,
	 * for example, call this method
	 * when received a input ack from server
	 */
	ackInput(ackData: AckData) {
		this.applyState({ x: ackData.x, y: ackData.y, motionX: ackData.motionX, motionY: ackData.motionY });

		const newPendingInputs: Input[] = [];
		for (const input of this.pendingInputs) {
			if (input.seqId > ackData.lastProcessedInput) {
				newPendingInputs.push(input);
				this.applyInput(input);
			}
		}

		this.pendingInputs = newPendingInputs;
	}

	doGameTick() {
		this.pendInput({ moveX: this.state.motionX / SERVER_TICKS_MULTIPLE, moveY: this.state.motionY / SERVER_TICKS_MULTIPLE });
	}
}
