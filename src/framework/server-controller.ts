import { IEventBus } from './bus-server';
import {
	ClassOf,
	ConvertInternalToExternalEvent,
	ExternalEvent,
	EXTERNAL_EVENT_HANDLER,
	GameEventEmitter,
	GetHandledEventBounds,
	InternalEvent,
} from './event';

export type TargetConnIdsProvider<T> = (param: T) => string[] | string;

export class ServerController extends GameEventEmitter {
	constructor(protected eventBus: IEventBus) {
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
	protected redirectToBusEvent<I extends InternalEvent, E extends ExternalEvent & InternalEvent>(
		from: GameEventEmitter,
		internalEvent: ClassOf<I>,
		externalEvent: ClassOf<E>,
		targetConnIdsProvider: TargetConnIdsProvider<I>,
	) {
		from.onEvent(internalEvent, (event: I) => {
			const remoteEvent = ConvertInternalToExternalEvent(event, internalEvent, externalEvent);
			const connIdsRet = targetConnIdsProvider(event);
			const connIds = typeof connIdsRet == 'string' ? [connIdsRet] : connIdsRet;
			this.eventBus.emitTo(connIds, remoteEvent);
		});
	}

	doTick(tick: number) {}
}
