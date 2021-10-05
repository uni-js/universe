export enum ActorType {
	PLAYER = 'player',
	BOW = 'bow',
	ARROW = 'arrow',
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

export enum AttachType {
	RIGHT_HAND = 'right_hand',
}

export interface AttachMappingUnit {
	[Direction.BACK]: [number, number];
	[Direction.FORWARD]: [number, number];
	[Direction.LEFT]: [number, number];
	[Direction.RIGHT]: [number, number];
	[key: string]: [number, number];
}

export interface AttachMapping {
	[AttachType.RIGHT_HAND]: AttachMappingUnit;
	[key: string]: AttachMappingUnit;
}
