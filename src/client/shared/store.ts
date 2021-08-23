import { MapStore, ObjectStore } from "../../shared/store";
import { ActorObject, BuildActorObjectHash, IGameObject } from "../shared/game-object";
import { BuildLandObjectIdHash, BuildLandObjectLocHash, LandObject } from "../object/land";
import { inject, injectable } from "inversify";

import * as PIXI from "pixi.js";

@injectable()
export class ObjectContainer extends PIXI.Container{};

@injectable()
export class BrickContainer extends PIXI.Container{};

@injectable()
export class ActorContainer extends PIXI.Container{};

@injectable()
export class UiContainer extends PIXI.Container{};


@injectable()
export class ActorStore extends ObjectStore<ActorObject>{
    constructor(@inject(ActorContainer) actorContainer: ActorContainer){
        super(actorContainer,BuildActorObjectHash)
    }    
}

@injectable()
export class UiStore extends ObjectStore<IGameObject>{
    constructor(@inject(UiContainer) uiContainer: UiContainer){
        super(uiContainer);
    }
}

@injectable()
export class LandStore extends ObjectStore<LandObject>{
    constructor(@inject(ActorContainer) actorContainer: ActorContainer){
        super(actorContainer,BuildLandObjectIdHash,BuildLandObjectLocHash)
    }
};

@injectable()
export class DataStore extends MapStore<any>{};
