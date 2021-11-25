import React from 'react';
import { useEventBus, useUIState } from '../../framework/client-side/user-interface/hooks';
import { ItemBlock } from './item-block';
import { BackpackContainerState } from '../module/inventory-module/ui-state';

import './backpack.css';

export function Backpack() {
	const container = useUIState(BackpackContainerState);
	const eventBus = useEventBus();

	const blockElems = [];

	function onBlockDrop(sourceContainerId: number, sourceIndex: number, targetContainerId: number, targetIndex: number) {
		eventBus.emit('ContainerMoveBlock', sourceContainerId, sourceIndex, targetContainerId, targetIndex);
	}

	if (container && container.blocks.length > 0) {
		for (let i = 0; i < container.blocks.length; i++) {
			blockElems[i] = (
				<ItemBlock
					className="backpack-block"
					containerId={container.containerId}
					index={i}
					itemType={container.blocks[i].itemType}
					count={0}
					highlight={false}
					onDrop={onBlockDrop}
				></ItemBlock>
			);
		}
	}

	return (
		<div className="backpack-wrapper" style={{ visibility: container.visible ? 'visible' : 'hidden' }}>
			<div className="backpack-main">
				<div className="backpack-body">{blockElems}</div>
			</div>
		</div>
	);
}
