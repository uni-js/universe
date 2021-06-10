import { doTickable } from "../../shared/update";
import Keyboard from "keyboardjs";
import { Vector2 } from "../../server/shared/math";


export enum InputKey{
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT"
}


export interface InputProvider extends doTickable{
    keyPress(key:InputKey) : boolean;
    cursorPress() : boolean;
    getCursorAt() : Vector2;
}


export class HTMLInputProvider implements InputProvider{
    private keysPressed = new Map<InputKey,boolean>();
    private cursorPressed = false;

    private actions :any = [];
    private tick = 0;
    private cursorAt = new Vector2(0,0);

    constructor(private elem : HTMLCanvasElement){
        this.bindKey("up",InputKey.UP);
        this.bindKey("down",InputKey.DOWN);
        this.bindKey("left",InputKey.LEFT);
        this.bindKey("right",InputKey.RIGHT);

        this.elem.addEventListener("mousemove",this.onCursorMove.bind(this));
        this.elem.addEventListener("mousedown",this.onCursorDown.bind(this));
        this.elem.addEventListener("mouseup",this.onCursorUp.bind(this));

    }
    private onCursorMove(event : MouseEvent){
        this.cursorAt = new Vector2(event.offsetX,event.offsetY);
    }
    private onCursorDown(){
        this.cursorPressed = true;
    }
    private onCursorUp(){
        this.cursorPressed = false;
    }
    
    private bindKey(keyName:string,inputKey:InputKey){
        Keyboard.on(keyName,()=>{
            this.keysPressed.set(inputKey,true);
        },()=>{
            this.actions.push([this.tick + 1,inputKey,false]);
            //下一个tick再设置该按键的状态为false
            //保证按键时长至少有一个tick
        });
        
    }
    keyPress(key: InputKey): boolean {
        return this.keysPressed.get(key)!;
    }
    cursorPress() : boolean{
        return this.cursorPressed;
    }
    getCursorAt(){
        return this.cursorAt;
    }
    private consumeActions(){
        const newActions = [];
        for(const action of this.actions){
            const [tickAt,inputKey,value] = action;
            if(tickAt != this.tick)
                newActions.push(action);
            else{
                this.keysPressed.set(inputKey,value);
            }
        }
        this.actions = newActions;
    }
    
    async doTick(): Promise<void> {
        this.consumeActions();
        this.tick++;
    }
}