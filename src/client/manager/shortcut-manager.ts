import { ObjectStore } from "../../shared/store";
import { InputKey, InputProvider } from "../input";
import { IGameObject } from "../layer/game-object";
import { StoreManager } from "../layer/manager";
import { TextureManager } from "../texture";
import { ItemShortcutBar } from "../ui/item-shortcut-bar";
import { IViewport } from "../viewport";

export class ShortcutManager extends StoreManager{
    private shortcutBar : ItemShortcutBar;

    constructor(
        private input : InputProvider,
        private uiStore : ObjectStore<IGameObject>,
        private viewport : IViewport,
        textureManager : TextureManager
        
    ){
        super();

        
        this.shortcutBar = new ItemShortcutBar(textureManager, 1,this.viewport.getWorldWidth(),this.viewport.getWorldHeight());
        this.uiStore.add(this.shortcutBar);

    }
    async doTick(tick: number){

        if(this.input.keyPress(InputKey.NUM_1))
            this.shortcutBar.setFocusIndex(0);
        else if(this.input.keyPress(InputKey.NUM_2))
            this.shortcutBar.setFocusIndex(1);
        else if(this.input.keyPress(InputKey.NUM_3))
            this.shortcutBar.setFocusIndex(2);
        else if(this.input.keyPress(InputKey.NUM_4))
            this.shortcutBar.setFocusIndex(3);
        else if(this.input.keyPress(InputKey.NUM_5))
            this.shortcutBar.setFocusIndex(4);

        
    }
}