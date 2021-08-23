import { Server, Socket } from 'socket.io';

import { EventEmitter } from '../server/shared/event';
import { IRemoteEvent } from './event';

const MsgPackParser = require('socket.io-msgpack-parser');

export const enum BusEvent {
	ClientDisconnectEvent = 'ClientDisconnectEvent',
	ClientConnectEvent = 'ClientConnectEvent',
}

export class EventBus extends EventEmitter {
	private server: Server;
	private map = new Map<string, Socket>();
	constructor() {
		super();

		this.server = new Server({
			parser: MsgPackParser,
			cors: {},
		});
		this.server.on('connect', this.handleConnection.bind(this));
	}
	private handleConnection(conn: Socket) {
		this.map.set(conn.id, conn);

		conn.onAny((event, ...args) => {
			this.emit(event, conn.id, ...args);
		});

		conn.on('disconnect', () => {
			this.map.delete(conn.id);
			this.emit(BusEvent.ClientDisconnectEvent, conn.id);
		});

		this.emit(BusEvent.ClientConnectEvent, conn.id);
	}
	getConnection(connId: string) {
		return this.map.get(connId);
	}
	emitTo(connIds: string[], event: IRemoteEvent) {
		for (const id of connIds) {
			const conn = this.getConnection(id);
			if (!conn) continue;
			conn.emit(event.getEventName(), event.serialize());
		}
	}
	emitToAll(event: IRemoteEvent) {
		for (const id of this.map.keys()) {
			const conn = this.getConnection(id);
			if (!conn) continue;
			conn.emit(event.getEventName(), event.serialize());
		}
	}
	listen(port: number) {
		this.server.listen(port);
	}
}
