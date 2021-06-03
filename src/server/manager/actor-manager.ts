import { Actor, ActorEvent, BuildActorHash } from "../layer/entity";
import { IndexedStore } from "../../shared/store";
import { Manager } from "../layer/manager";

export class ActorManager extends Manager{
    constructor(
            private actors : IndexedStore<Actor,typeof BuildActorHash>
        ){
        super();
        

    }
    private onNewPosEvent = (actor : Actor)=>{
        this.emit(ActorEvent.NewPosEvent,actor);
    }

    getAll(){
        return this.actors.getAll();
    }
    getActorById(actorId:string){
        return this.actors.get(BuildActorHash(actorId));
    }
    addActor(actor:Actor){
        this.actors.add(actor);
        actor.on(ActorEvent.NewPosEvent,this.onNewPosEvent);

        this.emit(ActorEvent.AddActorEvent,actor);
    }
    removeActor(actor:Actor){
        this.actors.remove(actor);
        actor.off(ActorEvent.NewPosEvent,this.onNewPosEvent);

        this.emit(ActorEvent.RemoveActorEvent,actor);
    }
 
    async doTick(tick:number){
        
        for(const actor of this.actors.getAll())
            actor.doTick(tick);

    }

}