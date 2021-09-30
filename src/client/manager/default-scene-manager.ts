import { injectable } from 'inversify';
import { GameManager } from '../shared/manager';

@injectable()
export class DefaultSceneManager extends GameManager {
	constructor() {
		super();
	}
	async doTick() {}
}
