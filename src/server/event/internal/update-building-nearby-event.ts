import { InternalEvent } from '../../../framework/event';

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
