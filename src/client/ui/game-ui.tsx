import { GameInfo, GameInfoType } from '../shared/store';
import { useCollection, useEventBus, useTicker } from './entry';
import React, { useState } from 'react';

export function GameUI(props: any) {
	const [name, setName] = useState<string>();

	const gameInfoList = useCollection(GameInfo);
	const eventBus = useEventBus();
	function onClicked() {
		eventBus.emit('PlayerNameClicked');
	}
	useTicker(() => {
		const playerInfo = gameInfoList.findOne({ type: GameInfoType.PLAYER_INFO });
		setName(playerInfo.playerName);
	});
	return (
		<div onClick={onClicked} style={{ pointerEvents: 'auto', fontSize: '24px', color: 'white' }}>
			{name}
		</div>
	);
}
