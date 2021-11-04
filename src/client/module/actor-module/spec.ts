import { ActorType } from '../../../server/module/actor-module/spec';
import { ActorFactoryMapper } from './actor';
import { Arrow, Bow } from '../bow-module/bow';
import { DroppedItemActor } from '../inventory-module/dropped-item';
import { Player } from '../player-module/player';

export const ActorMapper: ActorFactoryMapper = {
	[ActorType.BOW]: Bow,
	[ActorType.PLAYER]: Player,
	[ActorType.ARROW]: Arrow,
	[ActorType.DROPPED_ITEM]: DroppedItemActor,
};
