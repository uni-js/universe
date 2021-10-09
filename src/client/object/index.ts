import { ActorType } from '../../server/actor/spec';
import { ActorFactoryMapper } from '../shared/actor';
import { Arrow, Bow } from './bow';
import { DroppedItemActor } from './dropped-item';
import { Player } from './player';

export const ActorMapper: ActorFactoryMapper = {
	[ActorType.BOW]: Bow,
	[ActorType.PLAYER]: Player,
	[ActorType.ARROW]: Arrow,
	[ActorType.DROPPED_ITEM]: DroppedItemActor,
};
