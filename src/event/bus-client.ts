import { EventEmitter2 } from 'eventemitter2';
import { injectable } from 'inversify';
import { io } from 'socket.io-client';
import { IRemoteEvent } from './event';

/**
 * 这是将对象转换成二进制序列的Socket.IO解析器,极大降低了传输大小
 */
const MsgPackParser = require('socket.io-msgpack-parser');

@injectable()
export class EventBusClient extends EventEmitter2 {
	private client;
	constructor(url: string) {
		super();

		const isDebug = Boolean(process.env['DEBUG']);
		const option = isDebug ? {} : { parser: MsgPackParser };

		this.client = io(url, option);
		this.client.onAny((event, ...args) => {
			this.emit(event, ...args);
		});
	}
	emitEvent(event: IRemoteEvent) {
		this.client.emit(event.getEventName(), event.serialize());
	}
}
