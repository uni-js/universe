import { IEventBus } from '../../event/bus-server';
import { EXTERNAL_EVENT_HANDLER, GameEventEmitter, GetHandledEventBounds, INTERNAL_EVENT_HANDLER } from '../../event/spec';

export class ServerController extends GameEventEmitter {
	constructor(protected eventBus: IEventBus) {
		super();

		this.initExternalHandledEvents();
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

	private initExternalHandledEvents() {
		const bounds = GetHandledEventBounds(this, EXTERNAL_EVENT_HANDLER);
		for (const bound of bounds) {
			this.eventBus.onEvent(bound.eventClass, bound.bindToMethod.bind(this));
		}
	}

	doTick(tick: number) {}
}
