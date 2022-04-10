import { Actor, AttachPos, DirectionType } from '../actor/actor';
import { Vector2 } from '../utils/vector2';
import { Backpack } from '../container/backpack';
import { Shortcut } from '../container/shortcut';
import { RemoveLandEvent } from '../event/server';
import { ActorType } from '../actor/actor-type';
import { Land } from '../land/land';
import type { Server } from '../server';
import { Input } from '@uni.js/prediction';
import { ItemType } from '../item/item-type';
import { DroppedItemActor } from '../actor/dropped-item';

const PLAYER_CANSEE_LAND_RADIUS = 1;

export class Player extends Actor {
	private connId: string;
	private backpack: Backpack;
	private shortcut: Shortcut;
	private watchLands = new Set<Land>();

	constructor(connId: string, pos: Vector2, server: Server) {
		super({}, pos, server);
		this.connId = connId;

		this.backpack = new Backpack(this, server);
		this.shortcut = new Shortcut(this, server);

		this.watchLandsAllCansee();
	}

	setDirection(direction: DirectionType) {
		const hasChanged = super.setDirection(direction);

		if(hasChanged) {
			switch (direction) {
				case DirectionType.BACK:
					this.attachPos = new Vector2(0, -0.4);
					return;
				case DirectionType.FORWARD:
					this.attachPos = new Vector2(0, -0.5);
					return;
				case DirectionType.LEFT:
					this.attachPos = new Vector2(-0.35, -0.5);
					return;
				case DirectionType.RIGHT:
					this.attachPos = new Vector2(0.35, -0.5);
					return;
				default:
					this.attachPos = new Vector2(0, 0);
					return;
			}
		}

		return hasChanged;
	}

	getAttachPos(): Vector2 {
		return this.attachPos;
	}

	getSize(): Vector2 {
		return new Vector2(1, 1.5);
	}

	isPlayer(): boolean {
		return true;
	}

	canSeeLand(landPos: Vector2): boolean {
		const radius = PLAYER_CANSEE_LAND_RADIUS;
		const myLandPos = this.getLandPos();
		const dis = landPos.sub(myLandPos, true);
		return dis.x <= radius && dis.y <= radius;
	}

	getCanSeeLandsPos(): Vector2[] {
		const rad = PLAYER_CANSEE_LAND_RADIUS;
		const myLandPos = this.getLandPos();
		const landPoses: Vector2[] = [];
		for (let x = myLandPos.x - rad; x <= myLandPos.x + rad; x++)
			for (let y = myLandPos.y - rad; y <= myLandPos.y + rad; y++) {
				landPoses.push(new Vector2(x, y));
			}

		return landPoses;
	}

	getType(): number {
		return ActorType.PLAYER;
	}

	processInput(input: Input) {
		this.lastInputSeqId = input.seqId;
		this.setPosition(this.getPos().add(new Vector2(input.moveX, input.moveY)));
	}

	emitEvent(event: any) {
		this.manager.emitEvent(this, event);
	}

	unwatchUnvisibleLands() {
		for (const watchLand of this.watchLands) {
			if (!this.canSeeLand(watchLand.getLandPos())) {
				this.unwatchLand(watchLand);
			}
		}
	}

	watchLandsAllCansee() {
		const landPosArray = this.getCanSeeLandsPos();
		for (const landPos of landPosArray) {
			const land = this.world.ensureLand(landPos);
			this.watchLand(land);
		}
	}

	isWatchLand(land: Land) {
		return this.watchLands.has(land);
	}

	watchLand(land: Land) {
		if (this.watchLands.has(land)) {
			return;
		}

		this.watchLands.add(land);
		for (const actor of land.getActors()) {
			actor.showTo(this);
		}

		this.world.requestLandData(land.getLandPos());
	}

	unwatchLand(land: Land) {
		if (!this.watchLands.has(land)) {
			return;
		}

		if (land.isLoaded()) {
			const landPos = land.getLandPos();

			const event = new RemoveLandEvent();
			event.landX = landPos.x;
			event.landY = landPos.y;

			this.emitEvent(event);
		}

		this.watchLands.delete(land);
		for (const actor of land.getActors()) {
			actor.unshowTo(this);
		}
	}

	addItem(itemType: ItemType, count: number) {
		if (!this.backpack.addItem(itemType, count)) {
			console.error(`player = ${this.getId()} ${this.getConnId()} 's backpack is full`);
		}
	}

	addShortcutItem(itemType: ItemType, count: number) {
		if (!this.shortcut.addItem(itemType, count)) {
			console.error(`player = ${this.getId()} ${this.getConnId()} 's shortcut is full`);
		}
	}

	pickItem() {
		const actors = this.world.getRadiusActors(this.getPos(), 1);
		const droppedItems = actors.filter((actor) => {
			return actor.getType() === ActorType.DROPPED_ITEM;
		}) as DroppedItemActor[];

		for(const itemActor of droppedItems) {
			this.world.removeActor(itemActor);
			this.addShortcutItem(itemActor.getItemType(), itemActor.getItemCount());
		}
	}

	dropItem() {
		const block = this.shortcut.getCurrentBlock();
		if(!block) {
			return;
		}
		const droppedItem = new DroppedItemActor({
			itemType: block.getItemType(),
			itemCount: block.getCount()
		}, new Vector2(this.getX(), this.getY()), this.server);
		droppedItem.setMotion(this.getDirectionVector());

		this.shortcut.clearItem(this.shortcut.getCurrentIndex());
		this.world.addActor(droppedItem);
	}

	startUsing() {
		const item = this.shortcut.getCurrentItem();
		item && item.startUsing();
	}

	stopUsing() {
		const item = this.shortcut.getCurrentItem();
		item && item.stopUsing();
	}

	unattach(): void {
		this.shortcut.unholdBlock();
	}

	getShortcut() {
		return this.shortcut;
	}

	getBackpack() {
		return this.backpack;
	}

	getConnId() {
		return this.connId;
	}

	private doSyncContainer() {
		this.shortcut.syncDirtyToPlayer();
		this.backpack.syncDirtyToPlayer();
	}

	protected doUpdateMovementTick() {
		const isCrossing = super.doUpdateMovementTick();

		if (isCrossing) {
			this.watchLandsAllCansee();
			this.unwatchUnvisibleLands();
		}

		return isCrossing;
	}

	doTick(): void {
		super.doTick();
		this.doSyncContainer();
	}
}
