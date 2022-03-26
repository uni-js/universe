import { ContainerType, ContainerUpdateData } from '../types/container';

export class UpdateContainerEvent {
	playerId: number;
	containerId: number;
	containerType: ContainerType;
	updateData: ContainerUpdateData;
	isFullUpdate: boolean;
}
