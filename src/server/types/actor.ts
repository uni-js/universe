export enum ActorType {
	PLAYER,
	BOW,
	ARROW,
	DROPPED_ITEM,
}

export enum ActorTypeName {
	'player',
	'bow',
	'arrow',
	'dropitem',
}

export enum Direction {
	LEFT,
	RIGHT,
	FORWARD,
	BACK,
}

export enum RunningState {
	SILENT,
	WALKING,
	RUNNING,
}

export enum AttachType {
	RIGHT_HAND,
}

export interface AttachMappingUnit {
	[Direction.BACK]: [number, number];
	[Direction.FORWARD]: [number, number];
	[Direction.LEFT]: [number, number];
	[Direction.RIGHT]: [number, number];
	[key: number]: [number, number];
}

export interface AttachMapping {
	[AttachType.RIGHT_HAND]: AttachMappingUnit;
	[key: number]: AttachMappingUnit;
}
