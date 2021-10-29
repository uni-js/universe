import { BusEvent, EventBus, EventBusSymbol } from '../../framework/bus-server';
import { ServerController } from '../../framework/server-controller';
import { PlayerManager } from '../manager/player-manager';
import { inject, injectable } from 'inversify';

@injectable()
export class ConnectionController extends ServerController {
	constructor(@inject(EventBusSymbol) eventBus: EventBus, @inject(PlayerManager) private playerManager: PlayerManager) {
		super(eventBus);
		this.eventBus.on(BusEvent.ClientDisconnectEvent, this.onDisconnected.bind(this));
	}

	private onDisconnected(connId: string) {
		const player = this.playerManager.findEntity({ connId });
		if (!player) return;

		this.playerManager.removeEntity(player);
	}
}
