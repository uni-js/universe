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
export const IS_GAME_EVENT_EMITTER = Symbol();

/**
 * decorate a controller, to add a specified listener of an event and bind it to the method automatically.
 *
 * @param eventClass the event class specified
 */
export function HandleExternalEvent<T extends ExternalEvent>(eventClass: ClassOf<T>) {
	return Reflect.metadata(EXTERNAL_EVENT_HANDLER, { eventClass });
}

export function HandleInternalEvent<T extends InternalEvent>(emitterPropertyName: string, eventClass: ClassOf<T>) {
	return Reflect.metadata(INTERNAL_EVENT_HANDLER, { emitterPropertyName, eventClass });
}

export function getHandledEventBounds(object: any, sign: symbol): EventBound[] {
	const methods = getAllMethodsOfObject(object);
	const bounds: EventBound[] = [];
	for (const method of methods) {
		const metadata = Reflect.getMetadata(sign, object, method);
		if (metadata !== undefined) bounds.push({ bindToMethod: object[method], eventClass: metadata.eventClass, ...metadata });
	}
	return bounds;
}

export function copyOwnPropertiesTo(from: any, target: any) {
	const names = Object.getOwnPropertyNames(from);
	for (const property of names) {
		target[property] = from[property];
	}
}

export function convertInternalToExternalEvent<I extends InternalEvent, E extends ExternalEvent>(
	internalEvent: I,
	internaleventClass: ClassOf<I>,
	externaleventClass: ClassOf<E>,
) {
	const exEvent = new externaleventClass();
	copyOwnPropertiesTo(internalEvent, exEvent);
	return exEvent;
}

export class GameEventEmitter extends EventEmitter2 {
	[IS_GAME_EVENT_EMITTER] = true;

	constructor() {
		super();

		nextTick(() => this.initInternalHandledEvents());
	}

	private initInternalHandledEvents() {
		const bounds = getHandledEventBounds(this, INTERNAL_EVENT_HANDLER);
		for (const bound of bounds) {
			const emitterName = bound.emitterPropertyName as string;
			const emitter = (this as any)[emitterName] as GameEventEmitter;

			if (emitter[IS_GAME_EVENT_EMITTER] !== true)
				throw new Error(`the target emitter is not GameEventEmitter when binding ${bound.eventClass.name}`);

			emitter.onEvent(bound.eventClass, bound.bindToMethod.bind(this));
		}
	}

	onEvent<T extends InternalEvent>(eventClass: ClassOf<T>, listener: (event: T) => void) {
		this.on(eventClass.name, listener);
	}

	offEvent<T extends InternalEvent>(eventClass: ClassOf<T>, listener: (event: T) => void) {
		this.off(eventClass.name, listener);
	}

	emitEvent<T extends InternalEvent>(eventClass: ClassOf<T>, event: T) {
		this.emit(eventClass.name, event);
	}

	/**
	 * redirect the specified event,
	 * emit out once received a event
	 */
	redirectEvent<T extends InternalEvent>(from: GameEventEmitter, eventClass: ClassOf<T>) {
		from.onEvent(eventClass, (event: T) => {
			this.emitEvent(eventClass, event);
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

function getAllMethodsOfObject(object: any) {
	const prototype = Object.getPrototypeOf(object);
	return Object.getOwnPropertyNames(prototype).filter(function (property) {
		return typeof object[property] == 'function';
	});
}

function nextTick(fn: (...args: any[]) => any) {
	setTimeout(fn, 0);
}
