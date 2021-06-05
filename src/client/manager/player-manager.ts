import { Vector2 } from "../../server/shared/math";
import { IndexedStore, MapStore } from "../../shared/store";
import { InputKey, InputProvider } from "../input";
import { BuildGameObjectHash, IGameObject } from "../layer/game-object";
import { Player, PlayerObjectEvent } from "../object/player";
import { StoreManager } from "../layer/manager"
import { Viewport } from "../viewport";

export class PlayerManager extends StoreManager{
    constructor(
            private dataStore : MapStore<any>,
            private objectManager : IndexedStore<IGameObject,typeof BuildGameObjectHash>,
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

        player.setTakeControl();

    }
    private onPlayerControlMoved = (location : Vector2)=>{
        this.emit(PlayerObjectEvent.ControlMovedEvent,location);
    }
    getCurrentPlayer(){
        const player = this.dataStore.get("data.player.current") as Player;
        return player;
    }
    private doObjectsTick(tick:number){
        for(const object of this.objectManager.getAll()){
            object.doTick(tick);
        }
    }
    private doControlMoveTick(){

        const player = this.getCurrentPlayer();
        if(!player) return;

        //console.log(this.inputProvider.keyPress(InputKey.UP));
        if(this.inputProvider.keyPress(InputKey.UP)){
            player.controlMove(new Vector2(0,-0.1));
        }
        if(this.inputProvider.keyPress(InputKey.DOWN)){
            player.controlMove(new Vector2(0,0.1));
        }
        if(this.inputProvider.keyPress(InputKey.LEFT)){
            player.controlMove(new Vector2(-0.1,0));
        }
        if(this.inputProvider.keyPress(InputKey.RIGHT)){
            player.controlMove(new Vector2(0.1,0));
        }

        this.stage.moveCenter(player.position.x,player.position.y);
    }
    async doTick(tick : number){
        this.doObjectsTick(tick);
        this.doControlMoveTick();
    }


}