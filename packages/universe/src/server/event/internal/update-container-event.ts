import { InternalEvent } from '@uni.js/event';
import { ContainerType, ContainerUpdateData } from '../../module/inventory-module/spec';

export class UpdateContainerEvent extends InternalEvent {
	playerId: number;
	containerId: number;
	containerType: ContainerType;
	updateData: ContainerUpdateData;
	isFullUpdate: boolean;
}
