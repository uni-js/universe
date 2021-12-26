import { InternalEvent } from '@uni.js/event';

export class ContainerMoveBlockEvent extends InternalEvent {
	sourceContainerId: number;
	sourceIndex: number;
	targetContainerId: number;
	targetIndex: number;
}
