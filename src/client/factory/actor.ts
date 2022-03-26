import { Arrow, Bow } from '../objects/bow-object';
import { DroppedItemActor } from '../objects/dropped-item-object';
import { Player } from '../objects/player-object';
import { ActorFactory } from '../objects/actor-object';
import { ActorType } from '../../server/types/actor';

export const actorFactory = new ActorFactory();

actorFactory.addImpl(ActorType.PLAYER, Player);
actorFactory.addImpl(ActorType.BOW, Bow);
actorFactory.addImpl(ActorType.ARROW, Arrow);
actorFactory.addImpl(ActorType.DROPPED_ITEM, DroppedItemActor);
