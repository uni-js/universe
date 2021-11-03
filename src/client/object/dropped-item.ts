import { ActorType } from '../../server/module/actor-module/spec';
import { ItemType } from '../../server/module/inventory-module/item';
import { Vector2 } from '../../server/shared/math';
import { ActorConstructOption, ActorObject } from './actor';
import { TextureProvider } from '../../framework/texture';

export class DroppedItemActor extends ActorObject {
	public itemType: ItemType;

	constructor(serverId: number, option: ActorConstructOption, texture: TextureProvider) {
		super(serverId, option, new Vector2(option.sizeX, option.sizeY), ActorType.DROPPED_ITEM, texture);

		this.itemType = option.itemType;
		this.sprite.anchor.set(0.5, 0.5);

		this.singleTexture = this.texture.getOne(`item.${this.itemType}.normal`);
	}
}
