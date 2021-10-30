import { EventEmitter2 } from 'eventemitter2';

export type ClassOf<T> = { new (...args: any[]): T };

export class InternalEvent {}

export class ExternalEvent extends InternalEvent {}

export interface EventBound {
	bindToMethod: (...args: any[]) => void;
	eventClass: ClassOf<any>;
	[key: string]: any;
}

export const EXTERNAL_EVENT_HANDLER = Symbol();
export const INTERNAL_EVENT_HANDLER = Symbol();

/**
 * 该装饰器用于Controller, 添加一个指定事件的监听器并绑定到被修饰的方法
 *
 * @param eventClazz 指定的事件类
 */
export function HandleExternalEvent<T extends ExternalEvent>(eventClazz: ClassOf<T>) {
	return Reflect.metadata(EXTERNAL_EVENT_HANDLER, { eventClazz });
}

export function HandleInternalEvent<T extends InternalEvent>(emitterPropertyName: string, eventClazz: ClassOf<T>) {
	return Reflect.metadata(INTERNAL_EVENT_HANDLER, { emitterPropertyName, eventClazz });
}

export function GetHandledEventBounds(object: any, sign: symbol): EventBound[] {
	const methods = GetAllMethodsOfObject(object);
	const bounds: EventBound[] = [];
	for (const method of methods) {
		const metadata = Reflect.getMetadata(sign, object, method);
		if (metadata !== undefined) bounds.push({ bindToMethod: object[method], eventClass: metadata.eventClazz, ...metadata });
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
	CopyOwnPropertiesTo(internalEvent, exEvent);
	return exEvent;
}

export class GameEventEmitter extends EventEmitter2 {
	isGameEventEmitter = true;

	constructor() {
		super();

		setTimeout(() => this.initInternalHandledEvents(), 0);
	}

	private initInternalHandledEvents() {
		const bounds = GetHandledEventBounds(this, INTERNAL_EVENT_HANDLER);
		for (const bound of bounds) {
			const emitterName = bound.emitterPropertyName as string;
			const emitter = (this as any)[emitterName] as GameEventEmitter;

			if (emitter.isGameEventEmitter === false)
				throw new Error(`绑定了一个不是 GameEventEmitter 的内部事件: ${bound.eventClass.name}`);

			emitter.onEvent(bound.eventClass, bound.bindToMethod.bind(this));
		}
	}

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

export class AddEntityEvent extends InternalEvent {
	entityId: number;
	entity: unknown;
}

export class RemoveEntityEvent extends InternalEvent {
	entityId: number;
	entity: unknown;
}

function GetAllMethodsOfObject(object: any) {
	const prototype = Object.getPrototypeOf(object);
	return Object.getOwnPropertyNames(prototype).filter(function (property) {
		return typeof object[property] == 'function';
	});
}
