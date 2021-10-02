import { ActorType } from '../../shared/actor';
import { ActorFactoryMapper } from '../shared/actor';
import { Bow } from './bow';
import { Player } from './player';

export const ActorMapper: ActorFactoryMapper = {
	[ActorType.BOW]: Bow,
	[ActorType.PLAYER]: Player,
};
