import * as PIXI from "pixi.js";
import { TextureProvider } from "@uni.js/texture";
import { BuildingType } from "../../server/building/building-type";
import { Vector2 } from "../../server/utils/vector2";
import type { GameClientApp } from "../client-app";
import { orderObject } from "../actor/order";
import { ShadowObject } from "../objects/shadow";

export class Building extends PIXI.Container{
    private meta: number = 0;
    private type: BuildingType;
    private textureProvider: TextureProvider;
    private sprite: PIXI.Sprite;
    private shadow: ShadowObject;

    constructor(pos: Vector2, type: BuildingType, attrs: any, app: GameClientApp) {
        super();
        this.zIndex = 2;
        this.sprite = new PIXI.Sprite();
        this.type = type;
        this.textureProvider = app.textureProvider;
        this.position.set(pos.x, pos.y);
        this.sprite.anchor.set(attrs.anchorX, attrs.anchorY);

        this.sprite.width = attrs.sizeX;
        this.sprite.height = attrs.sizeY;

        this.shadow = new ShadowObject(this.textureProvider);
        this.shadow.setSize(this.sprite.width / 3);

        this.addChild(this.sprite);
        this.addChild(this.shadow);
        this.setMeta(attrs.meta);
    }

    getPos() {
        return new Vector2(this.position.x, this.position.y);
    }

    getX() {
        return this.position.x;
    }

    getY() {
        return this.position.y;
    }
 
    getType() {
        return this.type;
    }

    getMeta() {
        return this.meta
    }

    setMeta(meta: number) {
        this.meta = meta;
        this.updateTexture();
    }

    private updateTexture() {
        this.sprite.texture = this.getTexture();
    }

    getTexture() {
        return this.textureProvider.get(`building.${this.type}.${this.meta}`);
    }

	updateAttrs(attrs: any) {
		for (const attr in attrs) {
			const setter = (<any>this)[`set${attr[0].toUpperCase()}${attr.slice(1)}`];
			if(setter) {
				setter.call(this, attrs[attr])
			} else {
				(<any>this)[attr] = attrs[attr];
			}
		}
	}

    private doOrderTick() {
        orderObject(this);
    }

    doTick(tick: number) {
        this.doOrderTick();
    }
}