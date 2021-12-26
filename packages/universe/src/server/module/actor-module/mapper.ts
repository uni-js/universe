import { ActorFactory } from './actor-entity';
import { ActorType } from './spec';
import { Arrow, Bow } from '../bow-module/bow-entity';
import { Player } from '../player-module/player-entity';
import { DroppedItemActor } from '../pick-drop-module/dropped-item-entity';

export const actorFactory = new ActorFactory();

actorFactory.addImpl(ActorType.BOW, Bow);
actorFactory.addImpl(ActorType.ARROW, Arrow);
actorFactory.addImpl(ActorType.PLAYER, Player);
actorFactory.addImpl(ActorType.DROPPED_ITEM, DroppedItemActor);
