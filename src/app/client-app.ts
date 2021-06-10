import * as PIXI from "pixi.js";

import { HTMLInputProvider, InputProvider } from "../client/input";
import { DefaultSceneManager } from "../client/manager/default-scene-manager";
import { ActorManager } from "../client/manager/actor-manager";
import { PlayerManager } from "../client/manager/player-manager";
import { ActorObject, BuildActorObjectHash, BuildGameObjectHash } from "../client/layer/game-object";
import { ActorService } from "../client/service/actor-service";
import { BootService } from "../client/service/boot-service";
import { PlayerService } from "../client/service/player-service";
import { TextureManager } from "../client/texture";
import { EventBusClient } from "../event/bus-client";
import { MapStore, ObjectStore } from "../shared/store";
import { LandService } from "../client/service/land-service";
import { Viewport } from "../client/viewport";
import { BuildLandObjectIdHash, BuildLandObjectLocHash, LandObject } from "../client/object/land";
import { LandManager } from "../client/manager/land-manager";
import { CursorManager } from "../client/manager/cursor-manager";


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

    private actorContainer : PIXI.Container;
    private brickContainer : PIXI.Container;

    private eventBusClient : EventBusClient;

    private viewport : Viewport;
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
        

        this.viewport = new Viewport(this.worldWidth * this.resolution,this.worldHeight * this.resolution,this.worldWidth,this.worldHeight);

        this.viewport.moveCenter(0,0);

        this.actorContainer = new PIXI.Container();
        this.brickContainer = new PIXI.Container();

        this.viewport.addChild(this.actorContainer);
        this.viewport.addChild(this.brickContainer);

        this.app.stage.addChild(this.viewport);

        this.eventBusClient = new EventBusClient(serverUrl);
        
        this.inputProvider = new HTMLInputProvider(this.app.view);
        
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
        await this.textureManager.add("system.shadow","./texture/system/shadow.png");
        await this.textureManager.add("system.brick_highlight","./texture/system/brick_highlight.png");
        await this.textureManager.addJSON("actor.player","./texture/actor/player/player.json");

        await this.textureManager.add("brick.rock.normal","./texture/brick/rock/normal.png");
        await this.textureManager.add("brick.grass.normal","./texture/brick/grass/normal.png");
        await this.textureManager.add("brick.ice.normal","./texture/brick/ice/normal.png");
        await this.textureManager.add("brick.dirt.normal","./texture/brick/dirt/normal.png");
        await this.textureManager.add("brick.drydr.normal","./texture/brick/drydr/normal.png");
        await this.textureManager.add("brick.sand.normal","./texture/brick/sand/normal.png");
        await this.textureManager.add("brick.water.normal","./texture/brick/water/normal.png");
        await this.textureManager.add("brick.wetdr.normal","./texture/brick/wetdr/normal.png");

    }
    private initStores(){
        this.stores.set("Actor",new ObjectStore<ActorObject>(this.actorContainer,BuildActorObjectHash));
        this.stores.set("Land",new ObjectStore<LandObject>(this.actorContainer,BuildLandObjectIdHash,BuildLandObjectLocHash));

        this.stores.set("Data",new MapStore());

        
    }
    private initManagers(){
        const actorStore = this.stores.get("Actor")!;
        const landStore = this.stores.get("Land")!;
        const dataStore = this.stores.get("Data")!;

        const landManager = new LandManager(landStore);
        const playerManager = new PlayerManager(dataStore,actorStore,this.inputProvider,this.viewport)

        this.managers.set(ActorManager.name,new ActorManager(actorStore,this.actorContainer));
        this.managers.set(PlayerManager.name,playerManager);
        this.managers.set(LandManager.name,landManager);

        this.managers.set(CursorManager.name,new CursorManager(this.inputProvider,this.viewport,landManager,playerManager));

        this.managers.set(DefaultSceneManager.name,new DefaultSceneManager());
 
    }
    private initServices(){
        const actorManager : ActorManager = this.managers.get(ActorManager.name);
        const playerManager : PlayerManager = this.managers.get(PlayerManager.name);
        const landManager : LandManager = this.managers.get(LandManager.name);

        this.services.set(BootService.name,new BootService(this.eventBusClient));
        this.services.set(PlayerService.name,new PlayerService(
            this.eventBusClient,
            playerManager,
            actorManager
        ));
        this.services.set(ActorService.name,new ActorService(
            this.eventBusClient,
            actorManager,
            this.textureManager
        ));
        
        this.services.set(LandService.name,new LandService(this.eventBusClient,landManager,this.textureManager));
    }

    render(){

    }
}
