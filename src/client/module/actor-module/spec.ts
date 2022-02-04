import { ActorType } from '../../../server/module/actor-module/spec';
import { Arrow, Bow } from '../tool-module/bow-object';
import { DroppedItemActor } from '../inventory-module/dropped-item-object';
import { Player } from '../player-module/player-object';
import { ActorFactory } from './actor-object';

export const actorFactory = new ActorFactory();

actorFactory.addImpl(ActorType.PLAYER, Player);
actorFactory.addImpl(ActorType.BOW, Bow);
actorFactory.addImpl(ActorType.ARROW, Arrow);
actorFactory.addImpl(ActorType.DROPPED_ITEM, DroppedItemActor);
