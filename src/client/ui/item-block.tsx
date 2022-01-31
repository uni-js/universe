import classNames from 'classnames';
import React, { useState } from 'react';
import { useTexturePath, useTextureProvider } from '@uni.js/ui';
import { ItemType, ItemTypeName } from '../../server/module/inventory-module/spec';

import './item-block.css';

export interface ItemBlockProps {
	containerId: number;
	index: number;
	itemType: ItemType;
	count: number;
	highlight: boolean;
	className?: string;
	containerType: string;
	draggable?: boolean;
	onDragOver?: (index: number, containerId: number) => void;
	onDragLeave?: () => void;
	onDragEnd?: () => void;
	onMouseEnter?: () => void;
	onMouseMove?: () => void;
	onLeftClick?: () => void;
	onRightClick?: () => void;
	onDrop?: (sourceContainerId: number, sourceIndex: number, targetContainerId: number, targetIndex: number) => void;
}

export const ItemBlock = React.memo((props: ItemBlockProps) => {
	const provider = useTextureProvider();

	const [dragOver, setDragOver] = useState(false);

	function onBlockDragStart(ev: React.DragEvent) {
		const index = +ev.currentTarget.getAttribute('data-index');
		const image = ev.currentTarget.firstElementChild;

		if (props.itemType === ItemType.EMPTY) {
			ev.preventDefault();
			return;
		}

		ev.dataTransfer.setData(
			'text/plain',
			JSON.stringify({
				containerId: props.containerId,
				index,
			}),
		);
		ev.dataTransfer.setDragImage(image, 0, 0);
	}

	function onBlockDragOver(ev: React.DragEvent) {
		const index = +ev.currentTarget.getAttribute('data-index');

		ev.preventDefault();
		ev.dataTransfer.dropEffect = 'move';

		setDragOver(true);
		props.onDragOver && props.onDragOver(index, props.containerId);
	}

	function onBlockDragLeave() {
		setDragOver(false);
		props.onDragLeave && props.onDragLeave();
	}

	function onBlockDragEnd(ev: React.DragEvent) {
		setDragOver(false);
		props.onDragEnd && props.onDragEnd();
	}

	function onBlockDrop(ev: React.DragEvent) {
		const { containerId: sourceContainerId, index: sourceIndex } = JSON.parse(ev.dataTransfer.getData('text/plain'));
		const targetIndex = +ev.currentTarget.getAttribute('data-index');

		props.onDrop && props.onDrop(sourceContainerId, sourceIndex, props.containerId, targetIndex);
		setDragOver(false);
	}

	function onMouseUp(ev: React.MouseEvent) {
		ev.preventDefault();

		if (ev.button === 0) {
			props.onLeftClick && props.onLeftClick();
		} else if (ev.button === 2) {
			props.onRightClick && props.onRightClick();
		}
	}

	function onMouseEnter() {
		props.onMouseEnter && props.onMouseEnter();
	}

	function onMouseMove() {
		props.onMouseMove && props.onMouseMove();
	}

	const texturePath = useTexturePath(provider, `item.${ItemTypeName[props.itemType]}`);

	const clsName = classNames(
		{
			'item-block': true,
			'item-block-highlight': props.highlight,
			'item-block-drag-over': dragOver,
		},
		props.className,
	);
	return (
		<div
			draggable={props.draggable ? 'true' : 'false'}
			data-container-type={props.containerType}
			data-index={props.index}
			onDrop={onBlockDrop}
			onDragStart={onBlockDragStart}
			onDragOver={onBlockDragOver}
			onDragEnd={onBlockDragEnd}
			onDragLeave={onBlockDragLeave}
			onMouseEnter={onMouseEnter}
			onMouseUp={onMouseUp}
			onMouseMove={onMouseMove}
			onContextMenu={(e) => e.preventDefault()}
			className={clsName}
		>
			<img draggable="false" className="item-block-img" src={texturePath} />
		</div>
	);
});
