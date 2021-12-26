import { InternalEvent } from '@uni.js/event';

export class LandMoveEvent extends InternalEvent {
	actorId: number;
	targetLandPosX: number;
	targetLandPosY: number;
	sourceLandPosX: number;
	sourceLandPosY: number;
}
