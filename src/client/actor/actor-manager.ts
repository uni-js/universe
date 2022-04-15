import { EventBusClient, ObjectStore } from '@uni.js/client';
import { ActorType } from '../../server/actor/actor-type';
import { AddActorEvent, MoveActorEvent, RemoveActorEvent, ActorUpdateAttrsEvent } from '../../server/event/server';
import { Vector2 } from '../../server/utils/vector2';
import { GameClientApp } from '../client-app';
import { Player } from '../player/player';
import { ActorObject } from './actor';
import { Arrow, Bow } from './bow';
import { DroppedItemActor } from './dropped-item';

export class ActorManager {
	private actorStore: ObjectStore<ActorObject>;
	private eventBus: EventBusClient;
	constructor(private app: GameClientApp) {
		this.eventBus = this.app.eventBus;

		this.eventBus.on(AddActorEvent, this.onAddActorEvent.bind(this));
		this.eventBus.on(RemoveActorEvent, this.onRemoveActorEvent.bind(this));
		this.eventBus.on(MoveActorEvent, this.onMoveActorEvent.bind(this));
		this.eventBus.on(ActorUpdateAttrsEvent, this.onUpdateAttrsEvent.bind(this));

		this.actorStore = new ObjectStore((actor: ActorObject) => [actor.getServerId()], app.secondLayer);
		this.app.viewport.addChild(this.actorStore.container);
	}

	private onUpdateAttrsEvent(event: ActorUpdateAttrsEvent) {
		const actor = this.actorStore.get(event.actorId);
		actor.updateAttrs(event.updated);
	}

	private onMoveActorEvent(event: MoveActorEvent) {
		const actor = this.actorStore.get(event.actorId);
		if (actor.isPlayer()) {
			const player = <Player>actor;
			if (player.isMaster()) {
				player.ackInput({
					x: event.x,
					y: event.y,
					motionX: 0,
					motionY: 0,
					lastProcessedInput: event.inputSeq,
				});
				return;
			}
		}
		if (!actor.getAttachingActor()) {
			actor.addMovePoint(new Vector2(event.x, event.y));
		}
	}

	private onAddActorEvent(event: AddActorEvent) {
		let newActor;

		const actorFactoryMap: any = {
			[ActorType.PLAYER]: Player,
			[ActorType.BOW]: Bow,
			[ActorType.DROPPED_ITEM]: DroppedItemActor,
			[ActorType.ARROW]: Arrow
		}

		if (actorFactoryMap[event.actorType]) {
			newActor = new (actorFactoryMap[event.actorType])(event.actorId, new Vector2(event.x, event.y), event.attrs, this.app);
		} else {
			console.error(`can't create a new actor of type: ${event.actorType}`)
		}

		this.actorStore.add(newActor);
		console.log('a new actor has been added:', event);
	}

	private onRemoveActorEvent(event: RemoveActorEvent) {
		const actor = this.actorStore.get(event.actorId);
		this.actorStore.remove(actor);
	}

	getActor(...hashes: any[]) {
		return this.actorStore.get(...hashes);
	}

	doTick(tick: number) {
		for (const actor of this.actorStore.getAll()) {
			actor.doTick(tick);
		}
	}

}
