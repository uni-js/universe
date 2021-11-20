import classNames from 'classnames';
import React, { useState } from 'react';
import { useEventBus, useTexturePath, useTextureProvider, useUIState } from '../../framework/client-side/user-interface/hooks';
import { ItemType } from '../../server/module/inventory-module/item-entity';
import { BackpackContainerState } from '../module/inventory-module/ui-state';
import './backpack.css';

export function Backpack() {
	const container = useUIState(BackpackContainerState);
	const provider = useTextureProvider();
	const eventBus = useEventBus();

	const [dragOverIndex, setDragOverIndex] = useState<number>();

	const blockElems = [];

	function onBlockDragStart(ev: React.DragEvent) {
		const index = +ev.currentTarget.getAttribute('data-index');
		const image = ev.currentTarget.firstElementChild;

		if (container.blocks[index].itemType === ItemType.EMPTY) {
			ev.preventDefault();
			return;
		}

		ev.dataTransfer.setData(
			'text/plain',
			JSON.stringify({
				containerId: container.containerId,
				index,
			}),
		);
		ev.dataTransfer.setDragImage(image, 0, 0);
	}

	function onBlockDragOver(ev: React.DragEvent) {
		const index = +ev.currentTarget.getAttribute('data-index');

		ev.preventDefault();
		ev.dataTransfer.dropEffect = 'move';

		setDragOverIndex(index);
	}

	function onBlockDragLeave() {
		setDragOverIndex(undefined);
	}

	function onBlockDragEnd(ev: React.DragEvent) {
		setDragOverIndex(undefined);
	}

	function onBlockDrop(ev: React.DragEvent) {
		const { containerId: sourceContainerId, index: sourceIndex } = JSON.parse(ev.dataTransfer.getData('text/plain'));
		const targetIndex = +ev.currentTarget.getAttribute('data-index');

		eventBus.emit('ContainerMoveBlock', sourceContainerId, sourceIndex, container.containerId, targetIndex);
		setDragOverIndex(undefined);
	}

	for (const [index, block] of container.blocks.entries()) {
		const path = useTexturePath(provider, `item.${block.itemType}.normal`);
		blockElems.push(
			<div
				onDrop={onBlockDrop}
				onDragStart={onBlockDragStart}
				onDragLeave={onBlockDragLeave}
				onDragOver={onBlockDragOver}
				onDragEnd={onBlockDragEnd}
				draggable="true"
				className={classNames({
					'backpack-block': true,
					'backpack-block-drag-over': dragOverIndex === index,
				})}
				data-container-type="backpack"
				data-index={index}
				key={index}
			>
				<img draggable="false" src={path} />
			</div>,
		);
	}

	return (
		<div className="backpack-wrapper" style={{ visibility: container.visible ? 'visible' : 'hidden' }}>
			<div className="backpack-main">
				<div className="backpack-body">{blockElems}</div>
			</div>
		</div>
	);
}
