import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../framework/client-side/bus-client';
import { ClientSideController } from '../../framework/client-side/client-controller';
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
