import React, { useEffect, useState } from 'react';

import { Shortcut } from './shortcut';
import { useEventBus, useUIState } from '@uni.js/ui';
import { PlayerState } from '../ui-states/player';
import { AttachUsingUI } from './attach-using';
import { Backpack } from './backpack';

import './game-ui.css';

export function GameUI(props: any) {
	function onClicked() {
		eventBus.emit('PlayerNameClicked', {});
	}

	const [backpackVisible, setBackpackVisible] = useState(false);

	useEffect(() => {
		const callback = () => {
			setBackpackVisible(!backpackVisible);
		};
		eventBus.on('toggleBackpack', callback);
		return () => {
			eventBus.off('toggleBackpack', callback);
		};
	}, [backpackVisible]);

	const eventBus = useEventBus();
	const player = useUIState(PlayerState);

	const positionString = `${player?.position?.x.toFixed(2)},${player?.position?.y.toFixed(2)}`;

	return (
		<div onClick={onClicked}>
			<div id="player-name" style={{ fontSize: '24px', color: 'white' }}>
				{positionString}
			</div>
			<Backpack visible={backpackVisible}></Backpack>
			<div id="bottom-area">
				<AttachUsingUI></AttachUsingUI>
				<Shortcut></Shortcut>
			</div>
		</div>
	);
}
