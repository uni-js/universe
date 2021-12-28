import { InternalEvent } from '@uni.js/event';

interface NearbyBuilding {
	buildingId: number;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	bitmap: number[];
}

export class UpdateBuildingNearbyEvent extends InternalEvent {
	buildings: NearbyBuilding[];
}