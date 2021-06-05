import * as PIXI from "pixi.js"
import Pupa from "pupa";

export function GetEmptyTexture(){
    return PIXI.Texture.fromBuffer(new Uint8Array(1),1,1);
}

export async function LoadResource(url:string){
    const loader = new PIXI.Loader();
    loader.add("resource",url);

    
    const resource = await new Promise<PIXI.ILoaderResource>((resolve,reject)=>{
        loader.load((loader,resources)=>{
            resolve(resources["resource"]);
        });            
    });

    return resource;
}
export class TextureManager{
    private textures = new Map<string,PIXI.Texture[]>();
    constructor(){ }
    async add(name:string,url:string){

        const resource = await LoadResource(url);
        const texture = resource.texture!;
        this.textures.set(name,[texture]);
    }
    async addJSON(name:string,json_url : string){
        const resource = await LoadResource(json_url);
        this.textures.set(name,Object.values(resource.textures!));
    }
    /**
     * 增加一组被编号的材质
     * 一般用于动画帧
     * 
     * 请注意 name的格式如 texture.player.{order}
     * 
     * url_pattern的格式如 ./textures/player/{order}.png
     */
    async addGroup(name_pattern:string,url_pattern:string,count:number){
        
        for(let order=0;order<count;order++){
            
            const name = Pupa(name_pattern,{ order });
            const url = Pupa(url_pattern,{ order });

            await this.add(name,url);
        }
    }
    /**
     * 取出一组被编号的材质
     */
    getGroup(name_pattern:string,count:number){
        const group = [];
        for(let order=0;order<count;order++){
            
            const name = Pupa(name_pattern,{ order });
            const texture = this.get(name);
            if(!texture)
                return;
            group.push(texture);
            
        }
        return group;
    }
    get(name : string){
        return this.textures.get(name);
    }
    getOne(name:string){
        const textures = this.get(name);
        if(!textures)return;

        return textures[0];
    }
    
}