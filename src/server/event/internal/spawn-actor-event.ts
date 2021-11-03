import { InternalEvent } from '../../../framework/event';
import { ActorType } from '../../module/actor-module/spec';

export class SpawnActorEvent extends InternalEvent {
	fromPlayerId: number;
	actorId: number;
	actorType: ActorType;
	ctorOption: any;
}
