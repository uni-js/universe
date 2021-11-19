import { IEventBus } from './bus-server';
import {
	ClassOf,
	ExternalEvent,
	EXTERNAL_EVENT_HANDLER,
	GameEventEmitter,
	convertInternalToExternalEvent,
	getHandledEventBounds,
	InternalEvent,
} from '../event';

export type TargetConnIdsProvider<T> = (param: T) => string[] | string;

export class ServerSideController extends GameEventEmitter {
	constructor(protected eventBus: IEventBus) {
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
	 * redirect the event received,
	 * and publish the event to network event bus.
	 */
	protected redirectToBusEvent<I extends InternalEvent, E extends ExternalEvent & InternalEvent>(
		from: GameEventEmitter,
		internalEvent: ClassOf<I>,
		externalEvent: ClassOf<E>,
		targetConnIdsProvider: TargetConnIdsProvider<I>,
	) {
		from.onEvent(internalEvent, (event: I) => {
			const remoteEvent = convertInternalToExternalEvent(event, internalEvent, externalEvent);
			const connIdsRet = targetConnIdsProvider(event);
			const connIds = typeof connIdsRet == 'string' ? [connIdsRet] : connIdsRet;
			this.eventBus.emitTo(connIds, remoteEvent);
		});
	}

	doTick(tick: number) {}
}
