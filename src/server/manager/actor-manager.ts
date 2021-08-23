import { Actor, ActorEvent, BuildActorHash } from "../shared/entity";
import { Manager } from "../shared/manager";
import { inject, injectable } from "inversify";
import { ActorStore } from "../shared/store";

@injectable()
export class ActorManager extends Manager{
    constructor(
            @inject(ActorStore) private actors : ActorStore
        ){
        super();
        

    }
    private onNewPosEvent = (actor : Actor)=>{
        this.emit(ActorEvent.NewPosEvent,actor);        
    }
    private onBaseStateSetEvent = (actor : Actor)=>{
        this.emit(ActorEvent.NewBaseStateEvent,actor);
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
        actor.on(ActorEvent.NewBaseStateEvent,this.onBaseStateSetEvent);

        this.emit(ActorEvent.AddActorEvent,actor);
    }
    removeActor(actor:Actor){
        this.actors.remove(actor);
        actor.off(ActorEvent.NewPosEvent,this.onNewPosEvent);
        actor.off(ActorEvent.NewBaseStateEvent,this.onBaseStateSetEvent);

        this.emit(ActorEvent.RemoveActorEvent,actor);
    }
 
    async doTick(tick:number){
        
        for(const actor of this.actors.getAll())
            actor.doTick(tick);

    }

}