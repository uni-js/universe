import { ActorType } from '../../server/actor/spec';
import { ItemType } from '../../server/item';
import { Vector2 } from '../../server/shared/math';
import { ActorCtorOption, ActorObject } from '../shared/actor';
import { TextureProvider } from '../texture';

export class DroppedItemActor extends ActorObject {
	private itemType: ItemType;

	constructor(serverId: number, option: ActorCtorOption, texture: TextureProvider) {
		super(serverId, option, new Vector2(option.sizeX, option.sizeY), ActorType.DROPPED_ITEM, texture);

		this.itemType = option.itemType;
		this.sprite.anchor.set(0.5, 0.5);

		this.setTexture(this.texture.getOne(`item.${this.itemType}.normal`));
	}
}
