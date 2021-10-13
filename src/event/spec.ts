import { EventEmitter2 } from 'eventemitter2';
import { GetAllMethodsOfObject } from '../utils';

export type ClassOf<T> = { new (...args: any[]): T };

export class InternalEvent {}

export class ExternalEvent extends InternalEvent {
	isExternal = true;
}

export interface EventBound {
	eventClass: ClassOf<ExternalEvent>;
	bindToMethod: (event: ExternalEvent) => void;
}

export const HANDLE_EVENT_LISTENER = Symbol();

/**
 * 该装饰器用于Controller, 添加一个指定事件的监听器并绑定到被修饰的方法
 *
 * @param eventClazz 指定的事件类
 */
export function HandleEvent<T extends InternalEvent>(eventClazz: ClassOf<T>) {
	return Reflect.metadata(HANDLE_EVENT_LISTENER, eventClazz);
}

export function GetHandledEventBounds(object: any): EventBound[] {
	const methods = GetAllMethodsOfObject(object);
	const bounds: EventBound[] = [];
	for (const method of methods) {
		const clazz = Reflect.getMetadata(HANDLE_EVENT_LISTENER, object, method);
		bounds.push({ eventClass: clazz, bindToMethod: object[method] });
	}
	return bounds;
}

export function CopyOwnPropertiesTo(from: any, target: any) {
	const names = Object.getOwnPropertyNames(from);
	for (const property of names) {
		target[property] = from[property];
	}
}

export function ConvertInternalToExternalEvent<I extends InternalEvent, E extends ExternalEvent>(
	internalEvent: I,
	internalEventClazz: ClassOf<I>,
	externalEventClazz: ClassOf<E>,
) {
	const exEvent = new externalEventClazz();
	exEvent.isExternal = true;
	CopyOwnPropertiesTo(internalEvent, exEvent);
	return exEvent;
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
