import { BusEvent, EventBus, EventBusSymbol } from '../../event/bus-server';
import { Controller } from '../shared/controller';
import { PlayerManager } from '../manager/player-manager';
import { inject, injectable } from 'inversify';

@injectable()
export class ConnectionController implements Controller {
	constructor(@inject(EventBusSymbol) private eventBus: EventBus, @inject(PlayerManager) private playerManager: PlayerManager) {
		this.eventBus.on(BusEvent.ClientDisconnectEvent, this.onDisconnected.bind(this));
	}
	private onDisconnected(connId: string) {
		const player = this.playerManager.findEntity({ connId });
		if (!player) return;

		this.playerManager.removeEntity(player);
	}
	doTick(tick: number) {}
}
