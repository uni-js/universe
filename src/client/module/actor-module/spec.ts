import { ActorType } from '../../../server/module/actor-module/spec';
import { ActorFactoryMapper } from './actor-object';
import { Arrow, Bow } from '../bow-module/bow-object';
import { DroppedItemActor } from '../inventory-module/dropped-item-object';
import { Player } from '../player-module/player-object';

export const ActorMapper: ActorFactoryMapper = {
	[ActorType.BOW]: Bow,
	[ActorType.PLAYER]: Player,
	[ActorType.ARROW]: Arrow,
	[ActorType.DROPPED_ITEM]: DroppedItemActor,
};
