import { inject, injectable } from 'inversify';
import { ClientSideManager } from '@uni.js/client';
import { TextureProvider } from '@uni.js/texture';
import { UIEventBus } from '@uni.js/ui';
import { ConvertedMouseEvent, ViewportHTMLEventDispatcher, Viewport } from '@uni.js/viewport';
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
	private buildingRangeSelectingMode = false;
	private buildingRangeStartPoint: Vector2 | undefined;
	private buildingsNearby: NearbyBuilding[] = [];
	private coverObject: CoverObject;

	constructor(
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(BuildingCreatorLayer) private creatorLayer: BuildingCreatorLayer,
		@inject(Viewport) private viewport: Viewport,
		@inject(ViewportHTMLEventDispatcher) private viewportEventDispatcher: ViewportHTMLEventDispatcher,
		@inject(TextureProvider) textureProvider: TextureProvider,
		@inject(UIEventBus) private uiEventBus: UIEventBus,
	) {
		super();

		this.coverObject = new CoverObject(textureProvider);
		this.creatorLayer.add(this.coverObject);

		this.uiEventBus.on('SelectingBuildingRange', this.onSelectingBuildingRange.bind(this));

		this.viewportEventDispatcher.on('mousedown', (ev: ConvertedMouseEvent) => {
			if (!this.buildingRangeSelectingMode) return;

			const point = new Vector2(ev.floorX, ev.floorY);
			this.buildingRangeStartPoint = point;
			this.coverObject.coverRange = new Range2(point, point);
		});
		this.viewportEventDispatcher.on('mousemove', (ev: ConvertedMouseEvent) => {
			if (!this.buildingRangeStartPoint || !this.buildingRangeSelectingMode) return;

			const point = new Vector2(ev.floorX, ev.floorY);
			this.coverObject.coverRange = new Range2(this.buildingRangeStartPoint, point);
		});
		this.viewportEventDispatcher.on('mouseup', () => {
			if (!this.buildingRangeStartPoint || !this.buildingRangeSelectingMode) return;

			this.uiEventBus.emit('BuildingRangeSelected', this.coverObject.coverRange);
			this.buildingRangeSelectingMode = false;
		});
	}

	setBuildingsNearby(buildingsNearby: NearbyBuilding[]) {
		this.buildingsNearby = buildingsNearby;
	}

	private onSelectingBuildingRange(state: 'start' | 'end') {
		if (state === 'start') {
			this.buildingRangeSelectingMode = true;
		} else if (state === 'end') {
			this.coverObject.coverRange = undefined;
			this.buildingRangeStartPoint = undefined;
			this.buildingRangeSelectingMode = false;
		}
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
