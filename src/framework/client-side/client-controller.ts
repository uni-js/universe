import { EventBusClient } from './bus-client';
import {
	ExternalEvent,
	GameEventEmitter,
	InternalEvent,
	EXTERNAL_EVENT_HANDLER,
	convertInternalToExternalEvent,
	getHandledEventBounds,
} from '../event';

export type ClassOf<T> = { new (...args: any[]): T };

export class ClientSideController extends GameEventEmitter {
	/**
	 *
	 * @param eventBus event bus on network
	 */
	constructor(protected eventBus: EventBusClient) {
		super();

		this.initExternalHandledEvents();
	}

	private initExternalHandledEvents() {
		const bounds = getHandledEventBounds(this, EXTERNAL_EVENT_HANDLER);
		for (const bound of bounds) {
			this.eventBus.onEvent(bound.eventClass, bound.bindToMethod.bind(this));
		}
	}

	/**
	 * redirect the event specified, publish the event to event bus on network.
	 */
	protected redirectToBusEvent<I extends InternalEvent, E extends ExternalEvent & InternalEvent>(
		from: GameEventEmitter,
		internalEvent: ClassOf<I>,
		externalEvent: ClassOf<E>,
	) {
		from.onEvent(internalEvent, (event: I) => {
			const remoteEvent = convertInternalToExternalEvent(event, internalEvent, externalEvent);
			this.eventBus.emitBusEvent(remoteEvent);
		});
	}
}
