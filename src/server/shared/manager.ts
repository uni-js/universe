import { EventEmitter } from '../shared/event';
import { doTickable } from '../../shared/update';

export abstract class Manager extends EventEmitter implements doTickable {
	abstract doTick(tick: number): Promise<void>;
}
