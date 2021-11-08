import React from 'react';

import { Shortcut } from './shortcut';
import { useEventBus, useUIState } from '../../framework/client-side/user-interface/hooks';
import { PlayerState } from '../module/player-module/ui-state';
import { BowUI } from './bow';

import './game-ui.css';

export function GameUI(props: any) {
	function onClicked() {
		eventBus.emit('PlayerNameClicked');
	}

	const eventBus = useEventBus();
	const player = useUIState(PlayerState);
	return (
		<div onClick={onClicked}>
			<div id="player-name" style={{ pointerEvents: 'auto', fontSize: '24px', color: 'white' }}>
				{player?.playerName}
			</div>
			<div id="bottom-area">
				<BowUI></BowUI>
				<Shortcut></Shortcut>
			</div>
		</div>
	);
}
