import { AddActorEvent, MoveActorEvent, RemoveActorEvent, ActorUpdateAttrsEvent } from '../event/server';
import { Square2, Vector2 } from '../utils/vector2';
import type { PlayerManager } from '../player/player-manager';
import type { Server } from '../server';
import type { World } from '../land/world';
import { Player } from '../player/player';
import { posToLandPos } from '../land/land';
import { IEventBus } from '@uni.js/server';
import { AttributeMap } from './attribute';
import type { Building } from '../building/building';
import { Viewable } from './viewable';

export function directionToVector(dir: DirectionType, reverse: boolean = false) {
	let vec2: Vector2;
	if(dir === DirectionType.BACK) {
		vec2 = new Vector2(0, -1);
	} else if (dir === DirectionType.FORWARD) {
		vec2 = new Vector2(0, 1);
	} else if (dir === DirectionType.LEFT) {
		vec2 = new Vector2(-1, 0);
	} else {
		vec2 = new Vector2(1, 0);
	}

	return reverse ? vec2.swap() : vec2;
}

export interface Collision{
	isActor: boolean;
    hasCollision: true;
    backwards: Vector2;
	actor: Actor;
	building: Building;
}

export function getPointsSegmentInRect(segA: Vector2, segB: Vector2, minX: number, maxX: number, minY: number, maxY: number): Vector2[] {
    const points: Vector2[] = [];

	if (segB.x === segA.x) {
		const mnY = Math.min(segA.y, segB.y);
		const mxY = Math.max(segA.y, segB.y);
		if (!(segA.x >= minX && segA.x < maxX)) {
			return [];
		}
		if (minY >= mnY && minY < mxY) {
			points.push(new Vector2(segA.x, minY))
		}
		if (maxY >= mnY && maxY < mxY) {
			points.push(new Vector2(segA.x, maxY))
		}
		return points;
	}

	if (segB.y === segA.y) {
		const mnX = Math.min(segA.x, segB.x);
		const mxX = Math.max(segA.x, segB.x);
		if (!(segA.y >= minY && segA.y < maxY)) {
			return [];
		}
		if (minX >= mnX && minX < mxX) {
			points.push(new Vector2(minX, segA.y))
		}
		if (maxX >= mnX && maxX < mxX) {
			points.push(new Vector2(maxX, segA.y))
		}
		return points;
	}


    const k = (segB.y - segA.y) / (segB.x - segA.x); // k = tan(x)
    const b = segA.y - k * segA.x; // b = y1 - k * x1

    const y1 = k * minX + b;
    if (minY <= y1 && y1 < maxY) {
        points.push(new Vector2(minX, y1));
    }

    const y2 = k * maxX + b;
    if (minY <= y2 && y2 < maxY) {
        points.push(new Vector2(maxX, y2));
    }

    // x = (y - b) / k
    const x1 = (minY - b) / k;
    if (minX <= x1 && x1 < maxX) {
        points.push(new Vector2(x1, minY));
    }

    const x2 = (maxY - b) / k;
    if (minX <= x2 && x2 < maxX) {
        points.push(new Vector2(x2, maxY));
    }

    return points;
}

export function getFirstPointInSegment(segA: Vector2, segB: Vector2, points: Vector2[]) {
	if (points.length <= 0) {
		return;
	}
	if (segA.x === segB.x) {
		return points.sort((a, b) => (Math.abs(a.y - segA.y) - Math.abs(b.y - segA.y)))[0];
	}
	return points.sort((a, b) => (Math.abs(a.x - segA.x) - Math.abs(b.x - segA.x)))[0];
}

export function expandSegment(segA: Vector2, segB: Vector2, length: number): Vector2 {
    const dx = segB.x - segA.x;
    const dy = segB.y - segA.y;
    const dl = Math.sqrt(dx * dx + dy * dy);
    const cos = dx / dl;
    const sin = dy / dl;
    return segB.add(new Vector2(length * cos, length * sin));
}

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

export interface JumpInfo {
	direction: DirectionType;
	jumpUp: boolean;
	tick: number;
}

export interface AttachPos {
	[DirectionType.BACK]: [number, number];
	[DirectionType.FORWARD]: [number, number];
	[DirectionType.LEFT]: [number, number];
	[DirectionType.RIGHT]: [number, number];
	[key: number]: [number, number];
}

export abstract class Actor extends Viewable {
	static actorIdSum = 0;
	protected id: number;
	protected pos: Vector2;
	protected rotation: number;
	protected attaching: number;
	protected attachment: number;
	protected attrs = new AttributeMap();
	protected manager: PlayerManager;
	protected motion: Vector2 = new Vector2(0, 0);
	protected world: World;
	protected eventBus: IEventBus;
	protected lastInputSeqId = 0;
	protected direction = DirectionType.FORWARD;
	protected running = RunningType.SILENT;
	protected health = 0;
	protected maxHealth = 0;
	protected attachPos: Vector2 = new Vector2(0, 0);
	protected anchor: Vector2 = new Vector2(0.5, 1);

	protected isJump: JumpInfo | undefined;

	/**
	 * @type {number}
	 * 0.0~1.0
	 */
	protected friction = 0.2;

	protected lastTickPos: Vector2;

	constructor(protected buildData: any, pos: Vector2, protected server: Server) {
		super(server);
		this.id = Actor.actorIdSum++;
		this.lastTickPos = pos.clone();
		this.pos = pos.clone();
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

	getHash() {
		return this.id.toString();
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
		if (this.direction === direction) {
			return false;
		}
		this.direction = direction;
		return true;
	}

	getDirection() {
		return this.direction;
	}

	getDirectionVector() {
		const dir = this.getDirection();
		return directionToVector(dir);
	}

	setRunning(running: RunningType) {
		if (running === this.running) {
			return false;
		}
		this.running = running;
		return true;
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

	onBeshownToPlayer(player: Player): void {
		this.updateAttrs();
		const event = new AddActorEvent();
		event.actorId = this.getId();
		event.actorType = this.getType();
		event.x = this.getX();
		event.y = this.getY();
		event.attrs = this.attrs.getAll();

		player.emitEvent(event);
	}

	onBeunshownToPlayer(player: Player): void {
		const event = new RemoveActorEvent();
		event.actorId = this.getId();

		player.emitEvent(event);
	}
	
	getLand() {
		return this.server.getWorld().getLand(this.getLandPos());
	}

	isSlimActor() {
		return false;
	}

	canCheckBeCollusion() {
		return false;
	}

	canCheckCollusion() {
		return false;
	}

	checkCollusion(): Collision[] {
		if (!this.canCheckCollusion()) {
			return [];
		}
		const thisBounding = this.getBoundingBox()

		const collisions: Collision[] = [];
		const nearbys = this.world.getAreaNearbys(this.getBoundingBox());
		for(const nearby of nearbys) { 
			const isActor = nearby instanceof Actor;
			const asActor = nearby as Actor;
			if(this.isSlimActor() && isActor && asActor.isSlimActor()) {
				continue;
			}
			if(this.isSlimActor()) {
				const bbx = nearby.getBoundingBox();
				const width = thisBounding.lengthSquared();
				
				const from = this.lastTickPos;
				const to = expandSegment(from, this.pos, width);
				
				const points = getPointsSegmentInRect(from, to, bbx.fromX, bbx.toX, bbx.fromY, bbx.toY);
				if (points.length > 0) {
					const firstPoint = getFirstPointInSegment(from, to, points);
					const dx = to.x - firstPoint.x;
					const dy = to.y - firstPoint.y;
					collisions.push({
						hasCollision: true,
						backwards: new Vector2(-dx, -dy),
						isActor,
						actor: nearby as Actor,
						building: nearby as Building
					})
				}
			}
		}
		return collisions;
	}

	knockBack(powerVec: Vector2) {
		this.setMotion(this.motion.add(powerVec));
	}

	kill() {
		this.world.removeActor(this);
	}

	setPosition(pos: Vector2) {
		this.pos = pos;
	}

	setMotion(motion: Vector2) {
		this.motion = motion;
	}

	setHealth(health: number) {
		this.health = health;
	}

	onDeath() {
		
	}

	damage(costHealth: number) {
		const targetHealth = Math.max(this.health - costHealth, 0);
		this.setHealth(targetHealth);
		if (targetHealth === 0) {
			this.onDeath();
		}
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
		this.attrs.set('health', this.health);
		this.attrs.set('maxHealth', this.maxHealth);

		const { x, y } = this.getSize();
		this.attrs.set('sizeX', x);
		this.attrs.set('sizeY', y);

		if (this.isJump) {
			this.attrs.set('jumpState', this.isJump.jumpUp ? 1 : 2);
		} else {
			this.attrs.set('jumpState', 0);
		}
	}

	private doUpdateAttrsTick() {
		this.updateAttrs();
		if (this.attrs.hasDirty()) {
			const event = new ActorUpdateAttrsEvent();
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

	protected onCollisions(collisions: Collision[]) {

	}

	doCheckCollusionTick() {
		const collisions = this.checkCollusion();
		if (collisions.length > 0) {
			this.onCollisions(collisions);
		}
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

		this.doCheckCollusionTick();

		const event = new MoveActorEvent();
		event.actorId = this.getId();
		event.x = this.pos.x;
		event.y = this.pos.y;
		event.inputSeq = this.lastInputSeqId;

		this.manager.emitToViewers(this, event);

		this.lastTickPos = this.pos;
		return isCrossing;
	}

	getBoundingBox() {
		const size = this.getSize();
		const leftTopPoint = new Vector2(this.pos.x - size.x * this.anchor.x, this.pos.y - size.y * this.anchor.y);
		return new Square2(leftTopPoint, leftTopPoint.add(size));
	}

	jump(direction: DirectionType, jumpUp: boolean) {
		if (this.isJump) {
			return;
		}
		this.isJump = { direction, jumpUp, tick: 0 };
		this.setMotion(directionToVector(this.isJump.direction).mul(0.1));
	}

	private doUpdateAttachmentTick() {
		const actor = this.getAttachmentActor();
		if (actor) {
			actor.setPosition(this.pos.add(this.attachPos));
		}
	}

	private doMotionTick() {
		const newMotion = this.motion.mul(1 - this.friction);
		if(newMotion.length() > 0.001) {
			this.setMotion(newMotion);
		} else if(newMotion.length() > 0){
			this.setMotion(new Vector2(0, 0));
		}

		this.setPosition(this.pos.add(this.motion));
	}

	private doJumpingTick() {
		if (!this.isJump) {
			return;
		}
		if(this.isJump.tick >= 7) {
			this.isJump = undefined;
		} else {
			this.isJump.tick++;
		}

	}

	doTick() {
		this.doUpdateAttrsTick();
		this.doUpdateAttachmentTick();
		this.doUpdateMovementTick();
		this.doMotionTick();
		this.doJumpingTick();
	}
}
