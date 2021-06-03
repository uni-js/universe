import { doTickable } from "../../shared/update";
import Keyboard from "keyboardjs";


export enum InputKey{
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT"
}


export interface InputProvider extends doTickable{
    keyPress(key:InputKey) : boolean;
}


export class HTMLInputProvider implements InputProvider{
    private keysPress = new Map<InputKey,boolean>();
    private actions :any = [];
    private tick = 0;

    constructor(){
        this.bindKey("up",InputKey.UP);
        this.bindKey("down",InputKey.DOWN);
        this.bindKey("left",InputKey.LEFT);
        this.bindKey("right",InputKey.RIGHT);
    }
    private bindKey(keyName:string,inputKey:InputKey){
        Keyboard.on(keyName,()=>{
            this.keysPress.set(inputKey,true);
        },()=>{
            this.actions.push([this.tick + 1,inputKey,false]);
            //下一个tick再设置该按键的状态为false
            //保证按键时长至少有一个tick
        });
        
    }
    keyPress(key: InputKey): boolean {
        return this.keysPress.get(key)!;
    }
    private consumeActions(){
        const newActions = [];
        for(const action of this.actions){
            const [tickAt,inputKey,value] = action;
            if(tickAt != this.tick)
                newActions.push(action);
            else{
                this.keysPress.set(inputKey,value);
            }
        }
        this.actions = newActions;
    }
    
    async doTick(): Promise<void> {
        this.consumeActions();
        this.tick++;
    }
}