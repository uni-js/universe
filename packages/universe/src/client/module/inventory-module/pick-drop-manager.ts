import { inject, injectable } from 'inversify';
import { HTMLInputProvider, InputKey, InputProvider } from '@uni.js/html-input';
import { ClientSideManager } from '@uni.js/client';
import * as Events from '../../event/internal';

@injectable()
export class PickDropManager extends ClientSideManager {
	constructor(@inject(HTMLInputProvider) private input: InputProvider) {
		super();
	}

	doFixedUpdateTick() {
		if (this.input.keyDown(InputKey.Q)) {
			this.emitEvent(Events.DropItemEvent, {});
		}
		if (this.input.keyDown(InputKey.R)) {
			this.emitEvent(Events.PickItemEvent, {});
		}
	}
}
