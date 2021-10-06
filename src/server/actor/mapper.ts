import { Actor, ActorType } from './spec';
import { FactoryMapper } from '../../shared/factory';
import { Arrow, Bow } from '../entity/bow';
import { Player } from '../entity/player';

export const ActorMapper: FactoryMapper<string, Actor, any[]> = {
	[ActorType.BOW]: Bow,
	[ActorType.ARROW]: Arrow,
	[ActorType.PLAYER]: Player,
};
