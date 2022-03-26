import { ActorFactory } from '../entity/actor-entity';
import { Arrow, Bow } from '../entity/bow-entity';
import { Player } from '../entity/player-entity';
import { DroppedItemActor } from '../entity/dropped-item-entity';
import { ActorType } from '../types/actor';

export const actorFactory = new ActorFactory();

actorFactory.addImpl(ActorType.BOW, Bow);
actorFactory.addImpl(ActorType.ARROW, Arrow);
actorFactory.addImpl(ActorType.PLAYER, Player);
actorFactory.addImpl(ActorType.DROPPED_ITEM, DroppedItemActor);
