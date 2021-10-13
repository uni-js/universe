import { EventBusClient } from '../../event/bus-client';
import {
	ConvertInternalToExternalEvent,
	ExternalEvent,
	GameEventEmitter,
	GetHandledEventBounds,
	InternalEvent,
	EXTERNAL_EVENT_HANDLER,
} from '../../event/spec';

export type ClassOf<T> = { new (...args: any[]): T };

export class GameController extends GameEventEmitter {
	/**
	 *
	 * @param eventBus 网络事件总线
	 */
	constructor(protected eventBus: EventBusClient) {
		super();

		this.initExternalHandledEvents();
	}

	private initExternalHandledEvents() {
		const bounds = GetHandledEventBounds(this, EXTERNAL_EVENT_HANDLER);
		for (const bound of bounds) {
			this.eventBus.onEvent(bound.eventClass, bound.bindToMethod.bind(this));
		}
	}

	/**
	 * 重定向指定事件, 将事件发布到网络总线中
	 */
	redirectToRemoteEvent<I extends InternalEvent, E extends ExternalEvent & InternalEvent>(
		from: GameEventEmitter,
		internalEvent: ClassOf<I>,
		externalEvent: ClassOf<E>,
	) {
		from.onEvent(internalEvent, (event: I) => {
			const remoteEvent = ConvertInternalToExternalEvent(event, internalEvent, externalEvent);
			this.eventBus.emitBusEvent(remoteEvent);
		});
	}
}
