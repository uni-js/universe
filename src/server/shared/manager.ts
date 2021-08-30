import { EventEmitter } from '../shared/event';

export abstract class Manager extends EventEmitter {
	abstract doTick(tick: number): void;
}
