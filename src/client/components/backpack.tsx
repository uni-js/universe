import React from 'react';
import { useEventBus, useUIState } from '@uni.js/ui';
import { DropInfo, ItemBlock } from './item-block';
import { BackpackContainerState } from '../ui-states/inventory';

import './backpack.css';

export interface BackpackProps {
	visible?: boolean;
}

export function Backpack(props: BackpackProps) {
	const container = useUIState(BackpackContainerState);
	const eventBus = useEventBus();

	const blockElems = [];

	function onBlockDrop(dropInfo: DropInfo) {
		eventBus.emit('ContainerMoveBlock', dropInfo);
	}

	if (container && container.blocks.length > 0) {
		for (let i = 0; i < container.blocks.length; i++) {
			blockElems[i] = (
				<ItemBlock
					className="backpack-block"
					containerType="backpack"
					containerId={container.containerId}
					draggable={true}
					index={i}
					key={i}
					itemType={container.blocks[i].itemType}
					count={0}
					highlight={false}
					onDrop={onBlockDrop}
				></ItemBlock>
			);
		}
	}

	return (
		<div className="backpack-wrapper" style={{ visibility: props.visible ? 'visible' : 'hidden' }}>
			<div className="backpack">
				<div className="backpack-main">
					<div className="backpack-body">{blockElems}</div>
				</div>
				<div className="backpack-func"></div>
			</div>
		</div>
	);
}
