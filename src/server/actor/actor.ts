import { AddActorEvent, MoveActorEvent, RemoveActorEvent, UpdateAttrsEvent } from '../event/server';
import { Vector2 } from '../utils/vector2';
import type { PlayerManager } from '../player/player-manager';
import type { Server } from '../server';
import type { World } from '../land/world';
import { Player } from '../player/player';
import { posToLandPos } from '../land/land';
import { IEventBus } from '@uni.js/server';
import { AttributeMap } from './attribute';

export enum RunningType {
	SILENT,
	WALKING,
	RUNNING,
}

export enum DirectionType {
	FORWARD,
	BACK,
	LEFT,
	RIGHT,
}

export interface AttachPos {
	[DirectionType.BACK]: [number, number];
	[DirectionType.FORWARD]: [number, number];
	[DirectionType.LEFT]: [number, number];
	[DirectionType.RIGHT]: [number, number];
	[key: number]: [number, number];
}

export abstract class Actor {
	static actorIdSum = 0;
	protected id: number;
	protected pos: Vector2;
	protected rotation: number;
	protected attaching: number;
	protected attachment: number;
	protected attrs = new AttributeMap();
	protected manager: PlayerManager;
	protected useTicks: number = 0;
	protected motion: Vector2 = new Vector2(0, 0);
	protected world: World;
	protected eventBus: IEventBus;
	protected lastInputSeqId = 0;
	protected direction = DirectionType.FORWARD;
	protected running = RunningType.SILENT;
	protected attachPos: Vector2 = new Vector2(0, 0);
	protected anchor: Vector2 = new Vector2(0.5, 1);

	private lastTickPos: Vector2;
	private viewingPlayers = new Set<Player>();
	private isUsing: boolean = false;

	constructor(protected buildData: any, pos: Vector2, protected server: Server) {
		this.id = Actor.actorIdSum++;
		this.pos = pos;
		this.manager = this.server.getPlayerManager();
		this.world = this.server.getWorld();
		this.eventBus = this.server.getEventBus();
	}

	abstract getSize(): Vector2;
	abstract getType(): number;

	isPlayer() {
		return false;
	}

	getId() {
		return this.id;
	}

	getPos() {
		return this.pos;
	}

	getLandPos() {
		return posToLandPos(this.pos);
	}

	getX() {
		return this.pos.x;
	}

	getY() {
		return this.pos.y;
	}

	setDirection(direction: DirectionType) {
		this.direction = direction;
	}

	getDirection() {
		return this.direction;
	}

	setRunning(running: RunningType) {
		this.running = running;
	}

	attach(actor: Actor) {
		if (actor.attachment !== undefined) {
			return;
		}

		this.attaching = actor.getId();
		actor.attachment = this.getId();
	}

	unattach() {
		const attaching = this.world.getActor(this.attaching);
		if (this.attaching === undefined || !attaching) {
			return;
		}

		attaching.attachment = undefined;
		this.attaching = undefined;
	}

	showTo(player: Player) {
		if (this.viewingPlayers.has(player)) {
			return;
		}
		this.viewingPlayers.add(player);

		this.updateAttrs();
		const event = new AddActorEvent();
		event.actorId = this.getId();
		event.actorType = this.getType();
		event.x = this.getX();
		event.y = this.getY();
		event.attrs = this.attrs.getAll();

		player.emitEvent(event);
	}

	unshowTo(player: Player) {
		if (!this.viewingPlayers.has(player)) {
			return;
		}
		this.viewingPlayers.delete(player);

		const event = new RemoveActorEvent();
		event.actorId = this.getId();

		player.emitEvent(event);
	}

	showToAllCansee() {
		for (const player of this.server.getPlayerList().values()) {
			if (player.canSeeLand(this.getLandPos())) {
				this.showTo(player);
			}
		}
	}

	unshowToAll() {
		for (const viewer of this.getViewers()) {
			this.unshowTo(viewer);
		}
	}

	getViewers() {
		return Array.from(this.viewingPlayers.values());
	}

	getLand() {
		return this.server.getWorld().getLand(this.getLandPos());
	}

	kill() {
		this.getLand().removeActor(this);
	}

	startUsing() {
		this.isUsing = true;
	}

	endUsing() {
		this.isUsing = false;
	}

	update() {
		this.useTicks++;
	}

	setPosition(pos: Vector2) {
		this.pos = pos;
	}

	protected updateAttrs() {
		this.attrs.set('direction', this.direction);
		this.attrs.set('running', this.running);
		this.attrs.set('attachment', this.attachment);
		this.attrs.set('attaching', this.attaching);
		this.attrs.set('attachPos', this.attachPos);
		this.attrs.set('rotation', this.rotation);
		this.attrs.set('anchorX', this.anchor.x);
		this.attrs.set('anchorY', this.anchor.y);

		const { x, y } = this.getSize();
		this.attrs.set('sizeX', x);
		this.attrs.set('sizeY', y);
	}

	private doUpdateAttrsTick() {
		this.updateAttrs();
		if (this.attrs.hasDirty()) {
			const event = new UpdateAttrsEvent();
			event.actorId = this.getId();
			event.updated = this.attrs.getDirtyAll();
			this.attrs.cleanAllDirty();

			this.manager.emitToViewers(this, event);
		}
	}

	getAttachingActor() {
		return this.world.getActor(this.attaching);
	}

	getAttachmentActor() {
		return this.world.getActor(this.attachment);
	}

	protected doUpdateMovementTick() {
		if (this.lastTickPos && this.lastTickPos.equal(this.pos)) {
			return false;
		}

		const lastLandPos = this.lastTickPos && posToLandPos(this.lastTickPos);
		const nowLandPos = this.getLandPos();
		const isCrossing = lastLandPos && !lastLandPos.equal(nowLandPos);
		if (isCrossing) {
			const land = this.world.ensureLand(nowLandPos);
			land.addActor(this);

			if (lastLandPos) {
				const prevLand = this.world.getLand(lastLandPos);
				prevLand.removeActor(this);
			}
		}

		const event = new MoveActorEvent();
		event.actorId = this.getId();
		event.x = this.pos.x;
		event.y = this.pos.y;
		event.inputSeq = this.lastInputSeqId;

		this.manager.emitToViewers(this, event);

		this.lastTickPos = this.pos;
		return isCrossing;
	}

	private doUpdateAttachmentTick() {
		const actor = this.getAttachmentActor();
		if (actor) {
			actor.setPosition(this.pos.add(this.attachPos));
		}
	}

	private doMotionTick() {
		this.setPosition(this.pos.add(this.motion));
	}

	doTick() {
		this.doUpdateAttrsTick();
		this.doUpdateAttachmentTick();
		this.doUpdateMovementTick();
		this.doMotionTick();
	}
}
