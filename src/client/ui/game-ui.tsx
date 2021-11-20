import React from 'react';

import { Shortcut } from './shortcut';
import { useEventBus, useUIState } from '../../framework/client-side/user-interface/hooks';
import { PlayerState } from '../module/player-module/ui-state';
import { BowUI } from './bow';
import { Backpack } from './backpack';

import './game-ui.css';

export function GameUI(props: any) {
	function onClicked() {
		eventBus.emit('PlayerNameClicked');
	}

	const eventBus = useEventBus();
	const player = useUIState(PlayerState);
	return (
		<div onClick={onClicked}>
			<div id="player-name" style={{ fontSize: '24px', color: 'white' }}>
				{player?.playerName}
			</div>
			<Backpack></Backpack>
			<div id="bottom-area">
				<BowUI></BowUI>
				<Shortcut></Shortcut>
			</div>
		</div>
	);
}
