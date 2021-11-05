import { inject, injectable } from 'inversify';
import { HTMLInputProvider, InputKey, InputProvider } from '../../input';
import { ClientSideManager } from '../../../framework/client-manager';
import * as Events from '../../event/internal';

@injectable()
export class PickDropManager extends ClientSideManager {
	constructor(@inject(HTMLInputProvider) private input: InputProvider) {
		super();
	}

	async doTick() {
		if (this.input.keyDown(InputKey.Q)) {
			this.emitEvent(Events.DropItemEvent, {});
		}
	}
}