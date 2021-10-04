export enum ActorType {
	PLAYER = 'player',
	BOW = 'bow',
}

export enum Direction {
	LEFT = 'left',
	RIGHT = 'right',
	FORWARD = 'forward',
	BACK = 'back',
}

export enum RunningState {
	SILENT = 'silent',
	WALKING = 'walking',
	RUNNING = 'running',
}

export interface AttachMapping {
	[key: string]: {
		relativeX: number;
		relativeY: number;
	};
}

export const AttachMapping: AttachMapping = {
	RIGHT_HAND: {
		relativeX: 0.4,
		relativeY: -0.5,
	},
};
