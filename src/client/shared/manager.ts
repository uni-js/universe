import { EventEmitter2 } from 'eventemitter2';
import { doTickable } from '../../shared/update';

export interface IStoreManager extends doTickable, EventEmitter2 {}

export abstract class StoreManager extends EventEmitter2 implements IStoreManager {
	abstract doTick(tick: number): Promise<void>;
}
