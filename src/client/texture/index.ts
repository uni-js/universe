import * as PIXI from "pixi.js"

export class TextureManager{
    private loader = new PIXI.Loader();
    private textures = new Map<string,PIXI.Texture>();
    constructor(){ }
    async add(name:string,url:string){

        this.loader.add(name,url);

        const texture = await new Promise<PIXI.Texture>((resolve,reject)=>{
            this.loader.load((loader,resources)=>{
                resolve(resources[name].texture);
            });            
        });
        
        this.textures.set(name,texture);
    }
    get(name:string){
        return this.textures.get(name);
    }
    
}