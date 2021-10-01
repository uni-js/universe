export enum GameEvent {
	ControlMovedEvent = 'ControlMovedEvent',
	MoveActorEvent = 'MoveActorEvent',
	SetActorStateEvent = 'SetActorStateEvent',

	LandUsedEvent = 'LandUsedEvent',
	LandNeverUsedEvent = 'LandNeverUsedEvent',
	LandLoaded = 'LandLoaded',
	LandUnloaded = 'LandUnloaded',
	LandDataToPlayer = 'LandDataToPlayer',

	LandMoveEvent = 'LandMoveEvent',
	SpawnActorEvent = 'SpawnActorEvent',
	DespawnActorEvent = 'DespawnActorEvent',

	AddRecordAtProperty = 'AddRecordAtProperty',
	RemoveRecordAtProperty = 'RemoveRecordAtProperty',

	AddEntityEvent = 'AddEntityEvent',
	RemoveEntityEvent = 'RemoveEntityEvent',

	NewPosEvent = 'NewPosEvent',
	NewWalkStateEvent = 'NewWalkStateEvent',
}
