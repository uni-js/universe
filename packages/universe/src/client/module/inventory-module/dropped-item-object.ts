import { ActorType } from '../../../server/module/actor-module/spec';
import { ItemType, ItemTypeName } from '../../../server/module/inventory-module/spec';
import { Vector2 } from '../../../server/shared/math';
import { ActorConstructOption, ActorObject } from '../actor-module/actor-object';
import { TextureProvider } from '@uni.js/client';

export class DroppedItemActor extends ActorObject {
	public itemType: ItemType;
	private scaleTick = 0;

	constructor(serverId: number, option: ActorConstructOption, texture: TextureProvider) {
		super(serverId, option, new Vector2(option.sizeX, option.sizeY), ActorType.DROPPED_ITEM, texture);

		this.itemType = option.itemType;
		this.sprite.anchor.set(0.5, 1.3);
		this.hasShadow = true;

		this.singleTexture = this.textureProvider.getOne(`item.${ItemTypeName[this.itemType]}.normal`);
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
