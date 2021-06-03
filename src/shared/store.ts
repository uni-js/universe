import { EventEmitter } from "../server/shared/event";


export class SetStore extends Set{ };
export class MapStore<V> extends Map<string,V>{ };

export type Hasher<T> = (item : T)=>string[] | string;

export class IndexedStore<T,Hs extends Hasher<T>> extends EventEmitter{
    private map = new Map<string,T>();
    private set = new Set<T>();
    private length = 0;
    constructor(private hasher:Hs){
        super();
    }
    private getHashesOrFail(item : T,shouldExists = false) {
        const hashes = [this.hasher(item)].flat();
        
        const exists = hashes
            .map((hash) => this.map.has(hash))
            .find((has) => (has));
        if (exists && shouldExists == false)
            throw new Error(`该项已存在`);

        if (!exists && shouldExists == true)
            throw new Error(`该项不存在`);

        return hashes;
    }
    size() {
        return this.length;
    }
    add(item:T) {
        const hashes = this.getHashesOrFail(item,false);
        for (const hash of hashes)
            this.map.set(hash, item);
        this.set.add(item);
        this.length += 1;
        this.emit("add", item);
    }
    remove(item:T){
        const hashes = this.getHashesOrFail(item,true);

        for(const hash of hashes)        
            this.map.delete(hash);

        this.set.delete(item);
        this.length -= 1;

        this.emit("remove",item);
    }
    has(hash:string){
        return this.map.has(hash);
    }
    get(hash:string){
        return this.map.get(hash);
    }
    getAll(){
        return Array.from(this.set.values());
    }
    
}