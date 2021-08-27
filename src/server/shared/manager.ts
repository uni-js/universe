import { EventEmitter } from '../shared/event';
import { doTickable } from '../../shared/update';

export abstract class Manager extends EventEmitter {
	abstract doTick(tick: number): void;
}
