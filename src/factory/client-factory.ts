import { Arrow, Bow } from '../client/actor/bow';
import { DroppedItemActor } from '../client/actor/dropped-item';
import { Player } from '../client/player/player';
import { ActorType } from '../server/actor/actor-type';
import { Factory } from './factory-impl';

export const actorFactory = new Factory<ActorType>();

actorFactory.addImpl(ActorType.PLAYER, Player);
actorFactory.addImpl(ActorType.BOW, Bow);
actorFactory.addImpl(ActorType.ARROW, Arrow);
actorFactory.addImpl(ActorType.DROPPED_ITEM, DroppedItemActor);
