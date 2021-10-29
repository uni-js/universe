import { PlayerInfo } from '../store';
import { useData, useEventBus } from './entry';
import React from 'react';
import { Shortcut } from './shortcut';

import './game-ui.css';
import { BowUI } from './bow';

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
			<div id="bottom-area">
				<BowUI></BowUI>
				<Shortcut></Shortcut>
			</div>
		</div>
	);
}
