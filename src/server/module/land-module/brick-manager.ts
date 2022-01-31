import { Brick } from "./brick-entity"
import { EntityManager, injectCollection, EntityCollection, EntityBaseEvent } from "@uni.js/database"
import { BrickType } from "./spec"

const BRICK_MAX_LAYER = 8;

export interface BrickManagerEvents extends EntityBaseEvent {
    UpdateBrickEvent: {
        posX: number;
        posY: number;
        layers: number[]
    }
}

export class BrickManager extends EntityManager<Brick, BrickManagerEvents>{
    constructor(@injectCollection(Brick) private brickList: EntityCollection<Brick>){
        super(brickList)

    }

    placeLayer(id: number, brickType: BrickType) {
        const brick = this.brickList.findOne({ id });
        if(brick.layers.length >= BRICK_MAX_LAYER) return;

        brick.layers.push(brickType);
        this.notifyBrickUpdated(brick);
    }

    private notifyBrickUpdated(brick: Brick){
        this.emit("UpdateBrickEvent", {
            posX: brick.posX,
            posY: brick.posY,
            layers: brick.layers
        });
    }

    removeLayer(id: number) {
        const brick = this.brickList.findOne({ id });
        brick.layers.pop();

        this.notifyBrickUpdated(brick);
    }

}