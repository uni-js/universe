import { ObjectStore } from "../../shared/store";
import { InputKey, InputProvider } from "../input";
import { IGameObject } from "../layer/game-object";
import { StoreManager } from "../layer/manager";
import { TextureManager } from "../texture";
import { PlayerInventory } from "../ui/inventory";
import { IViewport } from "../viewport";

export class InventoryManager extends StoreManager{
    private playerInventory;

    constructor(
        private input : InputProvider,
        private uiStore : ObjectStore<IGameObject>,
        private viewport : IViewport,
        private textureManager : TextureManager
    ){
        super();

        this.playerInventory = new PlayerInventory(
            this.textureManager,
            this.viewport.getWorldWidth(),
            this.viewport.getWorldHeight()
        );
        this.uiStore.add(this.playerInventory);
    }
    async doTick(tick: number) {
        if(this.input.keyDown(InputKey.E)){
            this.playerInventory.toggleVisible();
        }

    }

}