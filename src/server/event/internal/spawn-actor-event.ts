import { InternalEvent } from '../../../framework/event';
import { ActorType } from '../../actor/spec';

export class SpawnActorEvent extends InternalEvent {
	fromPlayerId: number;
	actorId: number;
	actorType: ActorType;
	ctorOption: any;
}
