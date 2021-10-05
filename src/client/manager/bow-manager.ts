import { inject, injectable } from 'inversify';
import { GameManager } from '../shared/manager';
import { ActorManager } from './actor-manager';

@injectable()
export class BowManager extends GameManager {
	constructor(@inject(ActorManager) private actorManager: ActorManager) {
		super();
	}
}
