import { inject, injectable } from 'inversify';
import { GameEvent } from '../event';
import { HTMLInputProvider, InputKey, InputProvider } from '../input';
import { GameManager } from '../shared/manager';

@injectable()
export class PickDropManager extends GameManager {
	constructor(@inject(HTMLInputProvider) private input: InputProvider) {
		super();
	}
	async doTick() {
		if (this.input.keyDown(InputKey.Q)) {
			this.emit(GameEvent.DropItemEvent);
		}
	}
}
