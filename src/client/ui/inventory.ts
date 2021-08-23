import * as PIXI from "pixi.js";
import { ItemType } from "../../server/entity/item/item";
import { IGameObject } from "../shared/game-object";
import { TextureManager } from "../texture";

export class ItemBlock extends PIXI.Container{
    private itemEmpty : boolean = true;
    private itemType? : ItemType;
    private itemAmount : number = 0;

    private background;

    constructor(
            private posX : number,
            private posY : number,
            private blockWidth : number,
            private textureManager : TextureManager,
        ){
        super();

        this.position.set(this.posX,this.posY);

        this.background = PIXI.Sprite.from(this.textureManager.getOne(`inventory.block_background`));
        this.background.width = this.blockWidth;
        this.background.height = this.blockWidth;

        this.addChild(this.background);
    }
}

export class PlayerInventory extends PIXI.Container implements IGameObject{
    private blocks : ItemBlock[] = [];
    private size : number = 15;
    private sizePerLine : number = 5;
    private blockWidth = 1.5;
    private blockPadding = 0.2;
    private padding = 0.2;

    private background! : PIXI.Sprite;

    private getLineCount(){
        if(this.size % this.sizePerLine == 0){
            return this.size / this.sizePerLine;
        }else{
            return Math.floor(this.size / this.sizePerLine) + 1;
        }

    }
    private getUiWidth(){
        return this.padding * 2 + this.blockWidth * this.sizePerLine + (this.sizePerLine - 1) * this.blockPadding;
    }
    private getUiHeight(){
        return this.padding * 2 + this.blockWidth * this.getLineCount() + (this.getLineCount() - 1) * this.blockPadding;
    }
    constructor(
        private textureManager : TextureManager,
        private parentWidth : number,
        private parentHeight : number

    ){
        super();
        this.visible = false;
        
        this.updateLayout();
        this.initBackground();
        this.initBlocks();
    }
    private initBackground(){
        this.background = PIXI.Sprite.from(this.textureManager.getOne("inventory.background"));
        this.background.width = this.getUiWidth();
        this.background.height = this.getUiHeight();
        
        this.addChild(this.background);
    }
    private updateLayout(){
        const posX = this.parentWidth /2 - this.getUiWidth() /2;
        const posY = this.parentHeight /2 - this.getUiHeight() /2;

        this.position.set(posX,posY);
    }
    private initBlocks(){
        for(let i=0;i<this.size;i++){
            const indexAtLine = i % this.sizePerLine;
            const lineAt = Math.floor(i / this.sizePerLine);

            const blockX = this.padding + indexAtLine*(this.blockWidth+this.blockPadding);
            const blockY = this.padding + lineAt*(this.blockWidth+this.blockPadding);
            const block = new ItemBlock(blockX,blockY,this.blockWidth,this.textureManager);
            this.addChild(block);
            this.blocks.push(block);
        }
    }
    setVisible(visible : boolean){
        this.visible = visible;
    }
    toggleVisible(){
        this.visible = !this.visible;
    }
    getBlock(index : number){
        return this.blocks[index];
    }
    setItemBlock(index : number,block : ItemBlock){
        this.blocks[index] = block;
    }
    getObjectId() : string{
        return "";
    }
    async doTick(tick: number){

    }

}