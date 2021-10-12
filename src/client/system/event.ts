import { EventEmitter2 } from 'eventemitter2';

export function CopyOwnPropertiesTo(from: any, target: any) {
	const names = Object.getOwnPropertyNames(from);
	for (const property of names) {
		target[property] = from[property];
	}
}

export function ConvertInternalToExternalEvent<I extends InternalEvent, E extends ExternalEvent & InternalEvent>(
	internalEvent: I,
	internalEventClazz: ClassOf<I>,
	externalEventClazz: ClassOf<E>,
) {
	const exEvent = new externalEventClazz();
	exEvent.isExternal = true;
	CopyOwnPropertiesTo(internalEvent, exEvent);
	return exEvent;
}

export type ClassOf<T> = { new (...args: any[]): T };

export class InternalEvent {}

export class ExternalEvent extends InternalEvent {
	isExternal = true;
}

export class GameEventEmitter extends EventEmitter2 {
	onEvent<T extends InternalEvent>(eventClazz: ClassOf<T>, listener: (event: T) => void) {
		this.on(eventClazz.name, listener);
	}
	offEvent<T extends InternalEvent>(eventClazz: ClassOf<T>, listener: (event: T) => void) {
		this.off(eventClazz.name, listener);
	}

	emitEvent<T extends InternalEvent>(eventClazz: ClassOf<T>, event: T) {
		this.emit(eventClazz.name, event);
	}

	/**
	 * 重定向指定事件, 每接受到该事件就发布出去
	 */
	redirectEvent<T extends InternalEvent>(from: GameEventEmitter, eventClazz: ClassOf<T>) {
		from.onEvent(eventClazz, (event: T) => {
			this.emitEvent(eventClazz, event);
		});
	}
}
