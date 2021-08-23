import { BrickType } from '../entity/brick/types';

export interface BrickData {
	offX: number;
	offY: number;

	type: BrickType;
}

export enum LandEvent {
	LandLoaded = 'LandLoaded',
	LandUnloaded = 'LandUnloaded',
}

export interface LandData {
	bricks: BrickData[];
}
