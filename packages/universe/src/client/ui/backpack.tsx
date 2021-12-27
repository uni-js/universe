import React from 'react';
import { useEventBus, useUIState } from '@uni.js/ui';
import { ItemBlock } from './item-block';
import { BackpackContainerState } from '../module/inventory-module/ui-state';

import './backpack.css';

export interface BackpackProps {
	visible?: boolean;
	onOpenBuildingCreator: () => void;
}

export function Backpack(props: BackpackProps) {
	const container = useUIState(BackpackContainerState);
	const eventBus = useEventBus();

	const blockElems = [];

	function onBlockDrop(sourceContainerId: number, sourceIndex: number, targetContainerId: number, targetIndex: number) {
		eventBus.emit('ContainerMoveBlock', sourceContainerId, sourceIndex, targetContainerId, targetIndex);
	}

	function onCreatingBuilding() {
		props.onOpenBuildingCreator();
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
				<div className="backpack-func">
					<div className="backpack-func-building-creator" onClick={onCreatingBuilding}>
						Create Building
					</div>
				</div>
			</div>
		</div>
	);
}
