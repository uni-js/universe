import { inject, injectable } from 'inversify';
import { EventBusClient, ClientSideController } from '@uni.js/client';
import { LoginEvent } from '../event/external';

@injectable()
export class BootController extends ClientSideController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient) {
		super(eventBus);

		this.startGame();
	}

	startGame() {
		this.eventBus.emitBusEvent(new LoginEvent());
	}
}
