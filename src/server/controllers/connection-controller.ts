import { BusEvent, EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { ServerSideController } from '@uni.js/server';
import { PlayerMgr } from '../managers/player-mgr';
import { inject, injectable } from 'inversify';

@injectable()
export class ConnectionController extends ServerSideController {
	constructor(@inject(EventBusServerSymbol) eventBus: EventBusServer, @inject(PlayerMgr) private playerMgr: PlayerMgr) {
		super(eventBus);
		this.eventBus.on(BusEvent.ClientDisconnectEvent, this.onDisconnected.bind(this));
	}

	private onDisconnected(connId: string) {
		const player = this.playerMgr.findEntity({ connId });
		if (!player) return;

		this.playerMgr.removeEntity(player);
	}
}
