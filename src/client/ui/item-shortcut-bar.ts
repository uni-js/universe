import * as PIXI from "pixi.js";
import { Item } from "../../server/entity/item/item";
import { Vector2 } from "../../server/shared/math";
import { IGameObject } from "../shared/game-object";
import { TextureManager } from "../texture";


/**
 * 快捷栏的格子
 */
export class ShortcutBlock extends PIXI.Container{
    private item : Item | undefined;
    private background : PIXI.Sprite;
    private embed : PIXI.Sprite
    private embedEmptyTexture : PIXI.Texture;
    private highlighted : boolean = false;

    constructor(private textureManager : TextureManager,private blockWidth:number){
        super();

        this.embedEmptyTexture = this.textureManager.getOne("shortcut.block_embed_empty");
        this.embed = PIXI.Sprite.from(this.embedEmptyTexture);
        
        this.background = PIXI.Sprite.from(this.textureManager.getOne("shortcut.block_background.normal"));

        this.addChild(this.embed);
        this.addChild(this.background);

        this.updateDisplay();
    }
    private updateDisplay(){
        this.background.width = this.blockWidth;
        this.background.height = this.blockWidth;

        this.embed.width = this.blockWidth;
        this.embed.height = this.blockWidth;
        
        const textureName = `shortcut.block_background.${this.highlighted ?"normal":"highlight"}`;
        this.background.texture = this.textureManager.getOne(textureName);

    }
    setHighlight(highlight : boolean){
        this.highlighted = highlight;
        this.updateDisplay();
    }
    isEmpty(){
        return Boolean(this.item) === false;
    }
    getItem(){
        return this.item;
    }
    setItem(item : Item){
        this.item = item;
        this.embed.texture = this.textureManager.getOne(`item.${this.item.getType()}.normal`)!;
    }
    clearItem(){
        this.item = undefined;
        this.embed.texture = this.embedEmptyTexture;
    }
}

/**
 * 快捷栏
 */
export class ItemShortcutBar extends PIXI.Container implements IGameObject{
    static SHORTCUT_BAR_SIZE = 5;
    static SHORTCUT_BAR_GAP_WIDTH = 0.2;
    static SHORTCUT_PADDING = 0.2;

    private blocks : ShortcutBlock[] = [];
    private background : PIXI.Sprite;

    private focusIndex : number = 0;

    constructor(private textureManager : TextureManager,
        private blockWidth:number,
        private worldWidth:number,
        private worldHeight:number
    ){
        super();

        this.background = PIXI.Sprite.from(this.textureManager.getOne(`shortcut.shortcut_background`));

        this.addChild(this.background);
        this.initBlocks();
        this.setFocusIndex(0);
    }
    getObjectId(): string {
        return "";
    }
    async doTick(tick: number) {
        
    }
    private initBlocks(){
        for(let i=0;i<ItemShortcutBar.SHORTCUT_BAR_SIZE;i++){
            const block = new ShortcutBlock(this.textureManager,this.blockWidth);

            this.addChild(block);
            this.blocks.push(block);
        }
        this.updateDisplay();
    }
    private updateDisplay(){
        const bar_size = ItemShortcutBar.SHORTCUT_BAR_SIZE;
        const bar_gap = ItemShortcutBar.SHORTCUT_BAR_GAP_WIDTH;
        const bar_padding = ItemShortcutBar.SHORTCUT_PADDING;

        const total_width = bar_padding + bar_size * this.blockWidth + bar_gap * (bar_size - 1) + bar_padding;
        const total_height = bar_padding + this.blockWidth + bar_padding;

        this.background.width = total_width;
        this.background.height = total_height;

        this.position.x = this.worldWidth / 2 - total_width / 2;
        this.position.y = this.worldHeight - total_height - 0.2;

        this.blocks.forEach((block,index)=>{
            block.position.x = bar_padding + index*(this.blockWidth + bar_gap);
            block.position.y = bar_padding;
        });

        this.blocks.forEach((block,index)=>{
            block.setHighlight(index == this.focusIndex);
        })        
    }
    getFocusIndex(){
        return this.focusIndex;
    }
    setFocusIndex(index : number){
        this.focusIndex = index;
        this.updateDisplay();
    }
    getSize(){
        return ItemShortcutBar.SHORTCUT_BAR_SIZE;
    }
    getItem(index : number){
        return this.blocks[index].getItem();
    }
    setItem(index : number, item : Item){
        this.blocks[index].setItem(item);
    }
}