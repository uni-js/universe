import React from 'react';
import { ShortcutContainerState } from '../ui-states/inventory';
import { useEventBus, useUIState } from '@uni.js/ui';
import { DropInfo, ItemBlock } from './item-block';

import './shortcut.css';

export const SHORTCUT_SIZE = 5;

export function ShortcutBlock(props: any) {
	return <div className="shortcut-block"></div>;
}

export interface ShortcutProps {}

export function Shortcut(props: any) {
	const shortcut = useUIState(ShortcutContainerState);
	const eventBus = useEventBus();

	const blockElems = [];

	function onBlockDrop(dropInfo: DropInfo) {
		eventBus.emit('ContainerMoveBlock', dropInfo);
	}

	if (shortcut && shortcut.blocks.length > 0) {
		for (let i = 0; i < SHORTCUT_SIZE; i++) {
			const isCurrent = i == shortcut.currentIndexAt;
			blockElems[i] = (
				<ItemBlock
					className="shortcut-block"
					containerId={shortcut.containerId}
					containerType="shortcut"
					draggable={true}
					index={i}
					key={i}
					itemType={shortcut.blocks[i].itemType}
					count={0}
					highlight={isCurrent}
					onDrop={onBlockDrop}
				></ItemBlock>
			);
		}
	}

	return (
		<div className="shortcut-wrapper">
			<div className="shortcut-blank">{blockElems}</div>
		</div>
	);
}
