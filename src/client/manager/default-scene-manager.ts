import { injectable } from 'inversify';
import { StoreManager } from '../shared/manager';

@injectable()
export class DefaultSceneManager extends StoreManager {
	constructor() {
		super();
	}
	async doTick() {}
}
