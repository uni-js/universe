import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../framework/bus-client';
import { LoginEvent } from '../event/external';

@injectable()
export class BootController {
	constructor(@inject(EventBusClient) private eventBus: EventBusClient) {
		this.startGame();
	}

	startGame() {
		this.eventBus.emitBusEvent(new LoginEvent());
	}
}
