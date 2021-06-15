import { Vector2 } from "../../server/shared/math";
import { MapStore } from "../../shared/store";
import { InputKey, InputProvider } from "../input";
import { GameObjectEvent } from "../layer/game-object";
import { Player, PlayerObjectEvent } from "../object/player";
import { StoreManager } from "../layer/manager"
import { Viewport } from "../viewport";
import { Direction, WalkingState } from "../../shared/actor";

export class PlayerManager extends StoreManager{
    constructor(
            private dataStore : MapStore<any>,
            private inputProvider : InputProvider,
            private stage : Viewport
        ){
            super();
            
    }
    setCurrentPlayer(player: Player){
        const key = "data.player.current";
        if(this.dataStore.has(key))return;

        this.dataStore.set(key,player);
        player.on(PlayerObjectEvent.ControlMovedEvent,this.onPlayerControlMoved)
        player.on(GameObjectEvent.SetActorStateEvent,this.onSetActorState)

        player.setTakeControl();

    }
    private onPlayerControlMoved = (location : Vector2,direction : Direction,walking:WalkingState)=>{
        this.emit(PlayerObjectEvent.ControlMovedEvent,location,direction,walking);
    }
    private onSetActorState = (player : Player)=>{
        this.emit(GameObjectEvent.SetActorStateEvent,player);
    }
    getCurrentPlayer(){
        const player = this.dataStore.get("data.player.current") as Player;
        return player;
    }
    private doControlMoveTick(){

        const player = this.getCurrentPlayer();
        if(!player) return;

        const moveSpeed = 0.06;

        const upPress = this.inputProvider.keyPress(InputKey.W);
        const downPress = this.inputProvider.keyPress(InputKey.S);
        const leftPress = this.inputProvider.keyPress(InputKey.A);
        const rightPress = this.inputProvider.keyPress(InputKey.D);
        
        if(upPress && leftPress){

            player.controlMove(new Vector2(-0.707*moveSpeed,-0.707*moveSpeed));
        }else if(upPress && rightPress){
            player.controlMove(new Vector2(0.707*moveSpeed,-0.707*moveSpeed));
        }else if(downPress && leftPress){
            player.controlMove(new Vector2(-0.707*moveSpeed,0.707*moveSpeed));
        }else if(downPress && rightPress){
            player.controlMove(new Vector2(0.707*moveSpeed,0.707*moveSpeed));
        }else if(downPress){
            player.controlMove(new Vector2(0,moveSpeed));
        }else if(leftPress){
            player.controlMove(new Vector2(-moveSpeed,0));
        }else if(rightPress){
            player.controlMove(new Vector2(moveSpeed,0));
        }else if(upPress){
            player.controlMove(new Vector2(0,-moveSpeed));
        }

        this.stage.moveCenter(player.position.x,player.position.y);
    }
    async doTick(tick : number){
        this.doControlMoveTick();
    }


}