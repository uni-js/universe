import { PlayerInfo } from '../shared/store';
import { useData, useEventBus } from './entry';
import React from 'react';
import { Shortcut } from './shortcut';

export function GameUI(props: any) {
	function onClicked() {
		eventBus.emit('PlayerNameClicked');
	}

	const eventBus = useEventBus();
	const playerInfo = useData(PlayerInfo);
	return (
		<div onClick={onClicked}>
			<div id="player-name" style={{ pointerEvents: 'auto', fontSize: '24px', color: 'white' }}>
				{playerInfo?.playerName}
			</div>
			<Shortcut></Shortcut>
		</div>
	);
}
