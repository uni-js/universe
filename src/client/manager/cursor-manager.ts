import { inject, injectable } from 'inversify';
import { HTMLInputProvider } from '../input';
import { GameManager } from '../shared/manager';
import { Viewport } from '../viewport';
import { LandManager } from './land-manager';
import { PlayerManager } from './player-manager';

@injectable()
export class CursorManager extends GameManager {
	constructor(
		@inject(HTMLInputProvider) private input: HTMLInputProvider,
		@inject(Viewport) private viewport: Viewport,
		@inject(LandManager) private landManager: LandManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
	) {
		super();
	}

	async doTick(tick: number) {}
	private setCurrentHighLightBrick() {}
	private getPointAtBrick() {}
}
