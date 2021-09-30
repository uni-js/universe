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

	AddEntityEvent = 'AddEntityEvent',
	RemoveEntityEvent = 'RemoveEntityEvent',

	NewPosEvent = 'NewPosEvent',
	NewBaseStateEvent = 'NewBaseStateEvent',
}
