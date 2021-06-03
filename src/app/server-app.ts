import { EventBus } from "../event/bus-server";
import { Actor, BuildActorHash } from "../server/layer/entity";
import { BuildPlayerHash, Player } from "../server/entity/player";
import { ActorManager } from "../server/manager/actor-manager";
import { PlayerManager } from "../server/manager/player-manager";
import { LandMoveManager } from "../server/manager/land-move-manager";
import { ActorService } from "../server/service/actor-service";
import { PlayerService } from "../server/service/player-service";

import { wait } from "../server/shared/utils";
import { IndexedStore, MapStore, SetStore } from "../shared/store";
import { LandManager } from "../server/manager/land-manager";
import { BuildLandHash, Land } from "../server/entity/land";
import { ConnectionService } from "../server/service/connection-service";
import { createDatabase, IDatabase } from "../server/database"
import { LandService } from "../server/service/land-service";

export interface AppConfig{
    port:number
}

export class ServerApp{
    private db : IDatabase | undefined;

    private stores = new Map<string,any>();
    private managers = new Map<string,any>();
    private services = new Map<string,any>();

    private eventBus = new EventBus();
    
    private config : AppConfig;

    private tick = 0;

    constructor(config : AppConfig){
        this.config = config;

        this.initDatabase();
        this.initEventBus();
        this.initStores();
        this.initManagers();
        this.initServices();
        this.startLoop();
    }
    private initDatabase(){
        this.db = createDatabase(process.env.DB_LOCATION!);
    }
    private initEventBus(){
        this.eventBus.listen(this.config.port);
    }
    private initStores(){
        this.stores.set(Land.name,new IndexedStore<Land,any>(BuildLandHash));
        this.stores.set(Actor.name,new IndexedStore<Actor,any>(BuildActorHash));
        this.stores.set(Player.name,new IndexedStore<Player,any>(BuildPlayerHash));
    }
    private initManagers(){
        const landManager = new LandManager(this.db!,this.stores.get(Land.name)!)
        const actorManager = new ActorManager(this.stores.get(Actor.name)!);
        const playerManager = new PlayerManager(
            this.stores.get(Player.name)!,
            actorManager
        );
        const landMoveManager = new LandMoveManager(playerManager,actorManager,landManager);

        this.managers.set(ActorManager.name,actorManager);
        this.managers.set(PlayerManager.name,playerManager);
        this.managers.set(LandManager.name,landManager);
        this.managers.set(LandMoveManager.name,landMoveManager);
        
    }
    private initServices(){
        this.services.set(ActorService.name,new ActorService(
            this.eventBus,
            this.managers.get(ActorManager.name),
            this.managers.get(PlayerManager.name),
            this.managers.get(LandManager.name)
        ));

        this.services.set(PlayerService.name,new PlayerService(
            this.eventBus,
            this.managers.get(PlayerManager.name)
        ));

        this.services.set(ConnectionService.name,new ConnectionService(
            this.eventBus,
            this.managers.get(PlayerManager.name)
        ))
        this.services.set(LandService.name,new LandService(
            this.eventBus,
            this.managers.get(PlayerManager.name)
        ))
    
    }
    private async startLoop(){
        while(true){
            for(const manager of this.managers.values())
                await manager.doTick(this.tick);

            for(const service of this.services.values())
                await service.doTick(this.tick);
      
            await wait(50);

            this.tick += 1;
        }
    }

}