import { inject, injectable } from 'inversify';
import { HTMLInputProvider, InputKey, InputProvider } from '@uni.js/html-input';
import { ClientSideManager } from '@uni.js/client';


export interface PickDropManagerEvents {
	DropItemEvent: Record<string, never>,
	PickItemEvent: Record<string, never>
}

@injectable()
export class PickDropManager extends ClientSideManager<PickDropManagerEvents> {
	constructor(@inject(HTMLInputProvider) private input: InputProvider) {
		super();
	}

	doFixedUpdateTick() {
		if (this.input.keyDown(InputKey.Q)) {
			this.emit("DropItemEvent", {});
		}
		if (this.input.keyDown(InputKey.R)) {
			this.emit("PickItemEvent", {});
		}
	}
}
