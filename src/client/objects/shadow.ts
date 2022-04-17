import { TextureProvider } from "@uni.js/texture";
import { Sprite } from "pixi.js";

export class ShadowObject extends Sprite{
    private shadowWidth: number = 0;
    constructor(private textureProvider: TextureProvider) {
        super();
        this.anchor.set(0.5, 0.5);
        this.texture = this.textureProvider.get('system.shadow');
        this.setSize(0.5);
    }

    setSize(width: number) {
        this.shadowWidth = width;
        const shadowBounds = this.getLocalBounds();
        const shadowRatio = shadowBounds.height / shadowBounds.width;

        this.width = this.shadowWidth;
        this.height = this.shadowWidth * shadowRatio;
        this.position.set(0, 0);
    }
}