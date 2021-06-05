import * as PIXI from "pixi.js";

import { HTMLInputProvider, InputProvider } from "../client/input";
import { DefaultSceneManager } from "../client/manager/default-scene-manager";
import { ObjectManager } from "../client/manager/object-manager";
import { PlayerManager } from "../client/manager/player-manager";
import { BuildGameObjectHash } from "../client/layer/game-object";
import { ActorService } from "../client/service/actor-service";
import { BootService } from "../client/service/boot-service";
import { PlayerService } from "../client/service/player-service";
import { TextureManager } from "../client/texture";
import { EventBusClient } from "../event/bus-client";
import { IndexedStore, MapStore } from "../shared/store";
import { LandService } from "../client/service/land-service";
import { Viewport } from "../client/viewport";



PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.SORTABLE_CHILDREN = true;

export interface TextureDef{
    name:string,
    url:string
}


export class ClientApp{
    private tick = 0;

    private inputProvider : InputProvider;

    private app : PIXI.Application;

    private stores = new Map<string,any>();
    private managers = new Map<string,any>();
    private services = new Map<string,any>();

    private textureManager = new TextureManager();
    private textures:TextureDef[] = [];

    private eventBusClient : EventBusClient;

    private stage : Viewport;
    private resolution = 32;
    
    //比例4:3
    private worldWidth = 4*7;
    private worldHeight = 3*7;

    constructor(private serverUrl:string, private canvas: HTMLCanvasElement){
        
        this.app = new PIXI.Application({
            resolution:this.resolution,
            width:this.worldWidth,
            height:this.worldHeight
        });
        

        this.stage = new Viewport(this.worldWidth,this.worldHeight);
        this.stage.moveCenter(0,0);

        this.app.stage.addChild(this.stage);

        this.eventBusClient = new EventBusClient(serverUrl);
        
        this.inputProvider = new HTMLInputProvider();
        
        this.app.start();

    }
    getCanvas(){
        return this.app.view;
    }
    async start(){

        await this.initTextures();
        this.initStores();
        this.initManagers();
        this.initServices();

        this.startLoop();
    }
    private doTick(){
        this.inputProvider.doTick(this.tick);
        for(const manager of this.managers.values())
            manager.doTick(this.tick);

        this.tick += 1;
    }
    private startLoop(){
        this.app.ticker.add(this.doTick.bind(this));
    }
    private async initTextures(){
        await this.textureManager.add("brick.rock.normal","./texture/brick/rock/normal.png");
        await this.textureManager.add("brick.grass.normal","./texture/brick/grass/normal.png");
        await this.textureManager.add("system.shadow","./texture/system/shadow.png");
        await this.textureManager.addJSON("actor.player","./texture/actor/player/player.json");
        
    }
    private initStores(){
        this.stores.set("GameObject",new IndexedStore<any,any>(BuildGameObjectHash))
        this.stores.set("Data",new MapStore())
    }
    private initManagers(){
        const objectStore = this.stores.get("GameObject")!;
        const dataStore = this.stores.get("Data")!;

        this.managers.set(ObjectManager.name,new ObjectManager(objectStore,this.stage));
        this.managers.set(PlayerManager.name,new PlayerManager(dataStore,objectStore,this.inputProvider,this.stage));
        this.managers.set(DefaultSceneManager.name,new DefaultSceneManager());
 
    }
    private initServices(){
        const objectManager : ObjectManager = this.managers.get(ObjectManager.name);
        const playerManager : PlayerManager = this.managers.get(PlayerManager.name);

        this.services.set(BootService.name,new BootService(this.eventBusClient));
        this.services.set(PlayerService.name,new PlayerService(
            this.eventBusClient,
            playerManager,
            objectManager
        ));
        this.services.set(ActorService.name,new ActorService(
            this.eventBusClient,
            objectManager,
            this.textureManager
        ));
        
        this.services.set(LandService.name,new LandService(this.eventBusClient,objectManager,this.textureManager));        

    }

    render(){

    }
}
