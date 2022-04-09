import { ActorObject } from './actor';
import { ItemType } from '../../server/item/item-type';
import { Vector2 } from '../../server/utils/vector2';
import { ActorType } from '../../server/actor/actor-type';
import type { GameClientApp } from '../client-app';

export class DroppedItemActor extends ActorObject {
	public itemType: ItemType;
	private scaleTick = 0;

	constructor(serverId: number, pos: Vector2, attrs: any, app: GameClientApp) {
		super(serverId, pos, attrs, app);

		this.itemType = attrs.itemType;
		this.sprite.anchor.set(0.5, 1.3);
		this.setHasShadow(true);
		this.setTextures(this.textureProvider.get(`item.${this.itemType}`));
	}

	getType(): ActorType {
		return ActorType.DROPPED_ITEM;
	}

	doFixedUpdateTick() {
		const maxTicks = 180;
		const halfTicks = maxTicks / 2;
		const tick = this.scaleTick;
		const ratio = tick <= halfTicks ? (tick / halfTicks) * 2 - 1 : -(((tick - halfTicks) / halfTicks) * 2 - 1);
		this.spriteContainer.scale.x = ratio;

		this.scaleTick++;
		if (this.scaleTick > maxTicks) {
			this.scaleTick = 0;
		}
	}
}
