import React, { useState } from 'react';
import classnames from 'classnames';
import { ShortcutContainerState } from '../module/inventory-module/ui-state';
import { useEventBus, useTexturePath, useTextureProvider, useUIState } from '../../framework/client-side/user-interface/hooks';

import './shortcut.css';
import { ItemType } from '../../server/module/inventory-module/item-entity';

export const SHORTCUT_SIZE = 5;

export function ShortcutBlock(props: any) {
	return <div className="shortcut-block"></div>;
}

export interface ShortcutProps {}

export function Shortcut(props: any) {
	const shortcut = useUIState(ShortcutContainerState);
	const provider = useTextureProvider();
	const [dragOverIndex, setDragOverIndex] = useState<number>();
	const eventBus = useEventBus();

	const blockElems = [];

	function onBlockDragStart(ev: React.DragEvent) {
		const index = +ev.currentTarget.getAttribute('data-index');
		const image = ev.currentTarget.firstElementChild;

		if (shortcut.blocks[index].itemType === ItemType.EMPTY) {
			ev.preventDefault();
			return;
		}

		ev.dataTransfer.setData(
			'text/plain',
			JSON.stringify({
				containerId: shortcut.containerId,
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

		eventBus.emit('ContainerMoveBlock', sourceContainerId, sourceIndex, shortcut.containerId, targetIndex);
		setDragOverIndex(undefined);
	}

	if (shortcut && shortcut.blocks.length > 0) {
		for (let i = 0; i < SHORTCUT_SIZE; i++) {
			const texturePath = useTexturePath(provider, `item.${shortcut.blocks[i].itemType}.normal`);
			const isCurrent = i == shortcut.currentIndexAt;
			const clsName = classnames({
				'shortcut-block': true,
				'shortcut-block-highlight': isCurrent,
				'shortcut-block-drag-over': i === dragOverIndex,
			});
			blockElems[i] = (
				<div
					data-container-type="shortcut"
					data-index={i}
					onDrop={onBlockDrop}
					onDragStart={onBlockDragStart}
					onDragOver={onBlockDragOver}
					onDragEnd={onBlockDragEnd}
					onDragLeave={onBlockDragLeave}
					className={clsName}
					key={i}
				>
					<img className="shortcut-img" src={texturePath} />
				</div>
			);
		}
	}

	return (
		<div className="shortcut-wrapper">
			<div className="shortcut-blank">{blockElems}</div>
		</div>
	);
}
