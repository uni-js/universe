import { Arrow, Bow } from '../objects/bow-object';
import { DroppedItemActor } from '../objects/dropped-item-object';
import { Player } from '../objects/player-object';
import { ActorType } from '../../server/types/actor';
import { Factory, FactoryMapper } from '../../server/factory/factory';
import { ActorConstructOption, ActorObject } from '../objects/actor-object';
import { TextureProvider } from '@uni.js/texture';

export type ActorCtor = [number, ActorConstructOption, TextureProvider, ...any];
export type ActorFactoryMapper = FactoryMapper<ActorType, ActorObject, ActorCtor>;

export class ActorFactory extends Factory<ActorType, ActorObject, ActorCtor> {}

export const actorFactory = new ActorFactory();

actorFactory.addImpl(ActorType.PLAYER, Player);
actorFactory.addImpl(ActorType.BOW, Bow);
actorFactory.addImpl(ActorType.ARROW, Arrow);
actorFactory.addImpl(ActorType.DROPPED_ITEM, DroppedItemActor);
