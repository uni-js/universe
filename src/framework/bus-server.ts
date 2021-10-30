import { Server, Socket } from 'socket.io';
import { GetServerDebugDelay } from './debug';

import { ExternalEvent, GameEventEmitter } from './event';

const wait = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

const MsgPackParser = require('socket.io-msgpack-parser');

export const EventBusSymbol = Symbol();

export const enum BusEvent {
	ClientDisconnectEvent = 'ClientDisconnectEvent',
	ClientConnectEvent = 'ClientConnectEvent',
}

export interface IEventBus extends GameEventEmitter {
	emitTo(connIds: string[], event: ExternalEvent): void;
	emitToAll(event: ExternalEvent): void;
	listen(port: number): void;
}

export class EventBus extends GameEventEmitter implements IEventBus {
	private server: Server;
	private map = new Map<string, Socket>();
	constructor() {
		super();

		const isDebug = Boolean(process.env['DEBUG']);
		const cors = { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] };
		const option = isDebug ? { cors } : { cors, parser: MsgPackParser };

		this.server = new Server(option);
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
	private getConnection(connId: string) {
		return this.map.get(connId);
	}
	emitTo(connIds: string[], event: ExternalEvent) {
		for (const id of connIds) {
			const conn = this.getConnection(id);
			if (!conn) continue;
			conn.emit(event.constructor.name, event);
		}
	}
	emitToAll(event: ExternalEvent) {
		this.emitTo(Array.from(this.map.keys()), event);
	}
	listen(port: number) {
		this.server.listen(port);
	}
}

export interface DelayedRequest {
	emitToAll: boolean;
	connIds: string[];
	event: ExternalEvent;
}

export class DelayedEventBus extends GameEventEmitter implements IEventBus {
	private eventBus: EventBus;
	private requestQueue: DelayedRequest[] = [];
	private consuming = false;
	constructor() {
		super();
		this.eventBus = new EventBus();
		this.eventBus.onAny((eventName, ...args) => {
			this.emit(eventName, ...args);
		});
		this.startConsuming();
	}
	private async startConsuming() {
		this.consuming = true;
		while (this.consuming) {
			while (this.requestQueue.length > 0) {
				const request = this.requestQueue.shift();
				if (request.emitToAll) {
					this.eventBus.emitToAll(request.event);
				} else {
					this.eventBus.emitTo(request.connIds, request.event);
				}
			}
			await wait(GetServerDebugDelay());
		}
	}

	emitTo(connIds: string[], event: ExternalEvent): void {
		this.requestQueue.push({
			emitToAll: false,
			connIds,
			event,
		});
	}
	emitToAll(event: ExternalEvent): void {
		this.requestQueue.push({
			emitToAll: true,
			connIds: [],
			event,
		});
	}
	listen(port: number): void {
		this.eventBus.listen(port);
	}
}
