import { EventEmitter2 } from 'eventemitter2';

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

export const CORRECTION_RATIO = 10;

/**
 * support client-side prediction and server reconciliation
 */
export class PredictedInputManager extends EventEmitter2 {
	private state: EntityState;
	private simulatedState: EntityState;
	private inputSequenceCount = 0;
	private pendingInputs: Input[] = [];

	constructor(initState: EntityState) {
		super();
		this.state = initState;
		this.simulatedState = { ...this.state };
	}

	private applyInput(input: Input) {
		this.state.x += input.moveX;
		this.state.y += input.moveY;
		this.simulatedState.x += input.moveX;
		this.simulatedState.y += input.moveY;

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
		this.simulatedState.x = ackData.x;
		this.simulatedState.y = ackData.y;

		const newPendingInputs: Input[] = [];
		for (const input of this.pendingInputs) {
			if (input.seqId > ackData.lastProcessedInput) {
				newPendingInputs.push(input);

				this.simulatedState.x += input.moveX;
				this.simulatedState.y += input.moveY;
			}
		}

		this.pendingInputs = newPendingInputs;
	}

	doBlending() {
		const offsetX = this.state.x - this.simulatedState.x;
		const offsetY = this.state.y - this.simulatedState.y;

		this.state.x += -offsetX / CORRECTION_RATIO;
		this.state.y += -offsetY / CORRECTION_RATIO;

		this.applyState(this.state);
	}

	doGameTick() {
		this.doBlending();
	}
}
