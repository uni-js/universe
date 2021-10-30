import { InternalEvent } from '../../../framework/event';

export class LandLoadedEvent extends InternalEvent {
	landPosX: number;
	landPosY: number;
}
