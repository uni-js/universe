import { inject, injectable } from "inversify";
import { Vector2 } from "../../server/shared/math";
import { HTMLInputProvider } from "../input";
import { StoreManager } from "../shared/manager";
import { BrickObject } from "../object/brick";
import { Viewport } from "../viewport";
import { LandManager } from "./land-manager";
import { PlayerManager } from "./player-manager";

@injectable()
export class CursorManager extends StoreManager{
    private current_highlight? : BrickObject;

    constructor(
        @inject(HTMLInputProvider) private input : HTMLInputProvider,
        @inject(Viewport) private viewport : Viewport,
        @inject(LandManager) private landManager : LandManager,
        @inject(PlayerManager) private playerManager : PlayerManager
    ){
        super();
    }
    
    async doTick(tick: number){
        const brick = this.getPointAtBrick();
        const player = this.playerManager.getCurrentPlayer()
        
        if(player && brick){
            const playerAt = player.getPosition().divFloor(1);
            const brickAt = brick.getPosition();
            
            const abs = playerAt.subAbs(brickAt)
            if(abs.x <= 2 && abs.y <= 2)
                this.setCurrentHighLightBrick(brick);
            else
                this.setCurrentHighLightBrick(undefined);

        }
    }
    private setCurrentHighLightBrick(brick : BrickObject | undefined){
        if(this.current_highlight){
            this.current_highlight.setHighLight(false);
        }
        if(brick){
            this.current_highlight = brick;
            brick.setHighLight(true);    
        }
    }
    private getPointAtBrick(){
        const cursor = this.input.getCursorAt();
        const point = this.viewport.getWorldPointAt(cursor);
        const brick = this.landManager.getBrickByLoc(new Vector2(point.x,point.y));

        return brick;
    }
    
}