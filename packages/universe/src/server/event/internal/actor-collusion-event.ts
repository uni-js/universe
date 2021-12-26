import { InternalEvent } from '@uni.js/event';
import { ActorType } from '../../module/actor-module/spec';

interface CheckResult {
	actorId: number;
	actorType: ActorType;
	checkResponse: SAT.Response;
}

export class ActorCollusionEvent extends InternalEvent {
	actorId: number;
	actorType: ActorType;
	checkResults: CheckResult[];
}
