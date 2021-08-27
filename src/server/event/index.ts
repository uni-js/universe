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
	PlayerRemovedEvent = 'PlayerRemovedEvent',
	PlayerAddedEvent = 'PlayerAddedEvent',

	AddActorEvent = 'AddActorEvent',
	RemoveActorEvent = 'RemoveActorEvent',

	NewPosEvent = 'NewPosEvent',
	NewBaseStateEvent = 'NewBaseStateEvent',
}
