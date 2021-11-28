import { inject, injectable } from 'inversify';
import { ClientSideManager } from '../../../framework/client-side/client-manager';
import { TextureProvider } from '../../../framework/client-side/texture';
import { ConvertedMouseEvent, ViewportHTMLEventDispatcher } from '../../../framework/client-side/viewport/event-dispatcher';
import { Viewport } from '../../../framework/client-side/viewport/viewport';
import { Vector2 } from '../../../server/shared/math';
import { Range2 } from '../../../server/shared/range';

import * as Events from '../../event/internal';
import { BuildingCreatorLayer } from '../../store';
import { PlayerManager } from '../player-module/player-manager';
import { CoverObject } from './cover-object';

export interface NearbyBuilding {
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	bitmap: number[];
}

@injectable()
export class BuildingManager extends ClientSideManager {
	private buildingCreatingMode = false;
	private buildingRangeSelecting: Vector2 | undefined;
	private buildingsNearby: NearbyBuilding[] = [];
	private coverObject: CoverObject;

	constructor(
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(BuildingCreatorLayer) private creatorLayer: BuildingCreatorLayer,
		@inject(Viewport) private viewport: Viewport,
		@inject(ViewportHTMLEventDispatcher) private viewportEventDispatcher: ViewportHTMLEventDispatcher,
		@inject(TextureProvider) textureProvider: TextureProvider,
	) {
		super();

		this.coverObject = new CoverObject(textureProvider);
		this.creatorLayer.add(this.coverObject);

		this.viewportEventDispatcher.on('mousedown', (ev: ConvertedMouseEvent) => {
			const point = new Vector2(ev.floorX, ev.floorY);
			this.buildingRangeSelecting = point;
		});
		this.viewportEventDispatcher.on('mousemove', (ev: ConvertedMouseEvent) => {
			if (!this.buildingRangeSelecting) return;

			const point = new Vector2(ev.floorX, ev.floorY);
			this.coverObject.coverRange = new Range2(this.buildingRangeSelecting, point);
		});
		this.viewportEventDispatcher.on('mouseup', () => {
			this.buildingRangeSelecting = undefined;
		});
	}

	setBuildingCreatingMode(mode: boolean) {
		this.buildingCreatingMode = mode;
	}

	setBuildingsNearby(buildingsNearby: NearbyBuilding[]) {
		this.buildingsNearby = buildingsNearby;
	}

	private getCurrentBuilding() {
		const player = this.playerManager.getCurrentPlayer();
		return this.checkInBuilding(player.vPos);
	}

	private checkInBuilding(pos: Vector2) {
		for (const building of this.buildingsNearby) {
			if (pos.x > building.fromX && pos.x < building.toX && pos.y > building.fromY && pos.y < building.toY) {
				return building;
			}
		}
		return undefined;
	}

	doUpdateTick() {}
}
