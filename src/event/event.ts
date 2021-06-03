export interface IRemoteEvent{
    getEventName():string;
    serialize():any;
}

export class RemoteEvent implements IRemoteEvent{
    getEventName(){
        return (this.constructor as any).name;
    }
    serialize(){
        const properties = Object.getOwnPropertyNames(this);
        const object:any = {};
        for(const prop of properties){
            object[prop] = (this as any)[prop];
        }
        return object;
    }
}