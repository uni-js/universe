import type { ContainerType, ContainerUpdateData } from "../module/inventory-module/spec";

export class UpdateContainerEvent {
    playerId: number;
	containerId: number;
	containerType: ContainerType;
	updateData: ContainerUpdateData;
	isFullUpdate: boolean;
}
