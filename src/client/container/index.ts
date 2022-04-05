import { InputKey, InputProvider } from "@uni.js/html-input";
import { UIEventBus } from "@uni.js/ui";
import { BACKPACK_SIZE } from "../../server/container/backpack";
import { ContainerType } from "../../server/container/container-type";
import { SHORTCUT_SIZE } from "../../server/container/shortcut";
import { MoveItemEvent, SetShortcutIndexEvent } from "../../server/event/client";
import { SetContainerDataEvent } from "../../server/event/server";
import { ItemType } from "../../server/item/item-type";
import type { GameClientApp } from "../client-app";
import { DropInfo } from "../components/item-block";
import { BackpackContainerState, ContainerBlock, ContainerState, ShortcutContainerState } from "../ui-states/container";

export const keyIndexMapping: any = {
    [InputKey.NUM_1]: 0,
    [InputKey.NUM_2]: 1,    
    [InputKey.NUM_3]: 2,    
    [InputKey.NUM_4]: 3,
    [InputKey.NUM_5]: 4
}

export class ContainerManager{
    private backpackState: BackpackContainerState;
    private shortcutState: ShortcutContainerState;
    private input: InputProvider;

    constructor(private app: GameClientApp) {

        this.backpackState = this.app.uiStates.getState(BackpackContainerState);
        this.shortcutState = this.app.uiStates.getState(ShortcutContainerState);

        this.initBlocks(this.backpackState, BACKPACK_SIZE);
        this.initBlocks(this.shortcutState, SHORTCUT_SIZE);

        this.input = this.app.inputProvider;

        this.app.eventBus.on(SetContainerDataEvent, this.onSetContainerDataEvent.bind(this));
        this.app.uiEventBus.on("ContainerMoveBlock", this.onContainerMoveBlock.bind(this));
    }

    private onContainerMoveBlock(dropInfo: DropInfo) {
        const event = new MoveItemEvent();
        event.fromCont = dropInfo.sourceContainerId;
        event.fromIndex = dropInfo.sourceIndex;
        event.toCont = dropInfo.targetContainerId;
        event.toIndex = dropInfo.targetIndex;

        this.app.eventBus.emitBusEvent(event);
    }

    private initBlocks(state: ContainerState, count: number) {
        const blocks : ContainerBlock[] = [];
        for(let i = 0; i < count; i++) {
            blocks[i] = {
                index: i,
                itemType: ItemType.EMPTY,
                itemCount: 0
            };
        }
        state.blocks = blocks;
    }


    private onSetContainerDataEvent(event: SetContainerDataEvent) {
        if (event.contType === ContainerType.SHORTCUT) {
            this.shortcutState.containerId = event.contId;
            const blocks : ContainerBlock[] = this.shortcutState.blocks;
            for(const unit of event.data.units) {
                blocks[unit.index].itemType = unit.itemType;
                blocks[unit.index].itemCount = unit.count;
            }
            this.shortcutState.blocks = blocks;
        } else if (event.contType === ContainerType.BACKPACK) {
            this.backpackState.containerId = event.contId;
            const blocks : ContainerBlock[] = this.backpackState.blocks;
            for(const unit of event.data.units) {
                blocks[unit.index].itemType = unit.itemType;
                blocks[unit.index].itemCount = unit.count;
            }
            this.backpackState.blocks = blocks;
        }
    }

    setShortcutIndex(index: number) {
        if (this.shortcutState.currentIndexAt === index) {
            return;
        }

        this.shortcutState.currentIndexAt = index;

        const event = new SetShortcutIndexEvent();
        event.actorId = this.app.getPlayer().getServerId();
        event.index = index;

        this.app.eventBus.emitBusEvent(event);
    }

    doTick() {
        for(const key in keyIndexMapping) {
            if (this.input.keyDown(<InputKey>key)) {
                this.setShortcutIndex(keyIndexMapping[key]);
            }
        }
    }

}