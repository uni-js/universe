import { inject, injectable } from "inversify";
import { HTMLInputProvider, InputKey } from "../input";
import { StoreManager } from "../shared/manager";
import { UiStore } from "../shared/store";
import { TextureManager } from "../texture";
import { PlayerInventory } from "../ui/inventory";
import { Viewport } from "../viewport";

@injectable()
export class InventoryManager extends StoreManager{
    private playerInventory;

    constructor(
        @inject(HTMLInputProvider) private input : HTMLInputProvider,
        @inject(UiStore) private uiStore : UiStore,
        @inject(Viewport) private viewport : Viewport,
        @inject(TextureManager) private textureManager : TextureManager
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