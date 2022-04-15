import { EventBusClient, ObjectStore } from "@uni.js/client";
import { AddBuildingEvent, BuildingUpdateAttrsEvent, RemoveBuildingEvent } from "../../server/event/server";
import { Vector2 } from "../../server/utils/vector2";
import { GameClientApp } from "../client-app";
import { Building } from "./building";

export class BuildingManager{
    private buildingStore: ObjectStore<Building>;
    private eventBus: EventBusClient;
    constructor(private app: GameClientApp) {
        this.eventBus = app.eventBus;
        this.eventBus.on(AddBuildingEvent, this.onAddBuildingEvent.bind(this));
        this.eventBus.on(RemoveBuildingEvent, this.onRemoveBuildingEvent.bind(this));
        this.eventBus.on(BuildingUpdateAttrsEvent, this.onUpdateAttrsEvent.bind(this));

        this.buildingStore = new ObjectStore((building: Building) => [building.getServerId()], this.app.secondLayer);
        this.app.viewport.addChild(this.buildingStore.container);
    }
    
    private onAddBuildingEvent(event: AddBuildingEvent) {
        const newBuilding = new Building(event.bId, new Vector2(event.x, event.y), event.bType, event.attrs, this.app);
        this.buildingStore.add(newBuilding);
    }

    private onRemoveBuildingEvent(event: RemoveBuildingEvent) {
        const building = this.buildingStore.get(event.bId);
        this.buildingStore.remove(building);
    }

    private onUpdateAttrsEvent(event: BuildingUpdateAttrsEvent) {
        const building = this.buildingStore.get(event.bId);
        building.updateAttrs(event.updated);        
    }


	doTick(tick: number) {
		for (const building of this.buildingStore.getAll()) {
			building.doTick(tick);
		}
	}
}