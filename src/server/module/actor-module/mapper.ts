import { Actor, ActorType } from './spec';
import { FactoryMapper } from '../../../shared/factory';
import { Arrow, Bow } from '../bow-module/bow-entity';
import { Player } from '../player-module/player-entity';

export const ActorMapper: FactoryMapper<string, Actor, any[]> = {
	[ActorType.BOW]: Bow,
	[ActorType.ARROW]: Arrow,
	[ActorType.PLAYER]: Player,
};
