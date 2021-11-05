import { InternalEvent } from '../../../framework/event';
import { ContainerType, ContainerUpdateData } from '../../module/inventory-module/spec';

export class UpdateContainerEvent extends InternalEvent {
	playerId: number;
	containerId: number;
	containerType: ContainerType;
	updateData: ContainerUpdateData;
	isFullUpdate: boolean;
}
