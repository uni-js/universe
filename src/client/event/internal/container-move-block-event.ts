import { InternalEvent } from '../../../framework/event';

export class ContainerMoveBlockEvent extends InternalEvent {
	sourceContainerId: number;
	sourceIndex: number;
	targetContainerId: number;
	targetIndex: number;
}
