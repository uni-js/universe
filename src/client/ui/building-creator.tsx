import React, { useEffect, useState } from 'react';
import { useUIState } from '../../framework/client-side/user-interface/hooks';
import { ItemType, WallpaperTypes } from '../../server/module/inventory-module/item-entity';
import { BackpackContainerState } from '../module/inventory-module/ui-state';
import { ItemBlock } from './item-block';

import './building-creator.css';
import classNames from 'classnames';

export interface BuildingCreatorProps {
	width: number;
	height: number;
	visible: boolean;
	onCloseClicked: () => void;
}

export enum PaintType {
	NONE,
	DRAWING,
	ERASING,
}

export function BuildingCreator(props: BuildingCreatorProps) {
	const [showIndex, setShowIndex] = useState<number>();
	const [index, setIndex] = useState<number>();
	const [bitmap, setBitmap] = useState<ItemType[]>([]);
	const [dragPaint, setDragPaint] = useState<PaintType>(PaintType.NONE);

	const backpack = useUIState(BackpackContainerState);
	const blockItems = [];
	const canvasLines = [];

	function clearBitmap() {
		setBitmap(Array(props.width * props.height).fill(ItemType.EMPTY));
	}

	function setBitmapItem(index: number, itemType: ItemType) {
		if (bitmap[index] === itemType) return;
		bitmap[index] = itemType;
		setBitmap({ ...bitmap });
	}

	useEffect(() => {
		clearBitmap();
	}, [props.visible]);

	let showIndexCount = 0;
	for (let i = 0; i < backpack.blocks.length; i++) {
		const block = backpack.blocks[i];
		if (WallpaperTypes.includes(block.itemType)) {
			const currentShowIndex = showIndexCount;
			const isCurrent = currentShowIndex === showIndex;
			blockItems.push(
				<ItemBlock
					containerId={backpack.containerId}
					containerType="creator-picker"
					className={classNames({
						'creator-picker-selected': isCurrent,
					})}
					index={block.index}
					key={i}
					onLeftClick={() => {
						setShowIndex(currentShowIndex);
						setIndex(block.index);
					}}
					itemType={backpack.blocks[i].itemType}
					count={0}
					highlight={isCurrent}
				/>,
			);
			showIndexCount++;
		}
	}

	for (let y = 0; y < props.height; y++) {
		const lineBlocks = [];
		for (let x = 0; x < props.width; x++) {
			const blockIndex = y * props.width + x;

			lineBlocks.push(
				<ItemBlock
					className="building-creator-canvas-block"
					containerId={backpack.containerId}
					containerType="creator-canvas"
					index={blockIndex}
					key={blockIndex}
					onLeftClick={() => {
						setBitmapItem(blockIndex, backpack.blocks[index].itemType);
					}}
					onRightClick={() => {
						setBitmapItem(blockIndex, ItemType.EMPTY);
					}}
					onMouseEnter={() => {
						if (dragPaint === PaintType.DRAWING) {
							setBitmapItem(blockIndex, backpack.blocks[index].itemType);
						} else if (dragPaint === PaintType.ERASING) {
							setBitmapItem(blockIndex, ItemType.EMPTY);
						}
					}}
					itemType={bitmap[blockIndex]}
					count={1}
					highlight={false}
				/>,
			);
		}
		canvasLines.push(<div className="building-creator-canvas-line">{lineBlocks}</div>);
	}

	return (
		<div className="building-creator" style={{ visibility: props.visible ? 'visible' : 'hidden' }}>
			<div className="building-creator-close" onClick={() => props.onCloseClicked()}>
				close
			</div>
			<div className="building-creator-picker">{blockItems}</div>
			<div className="building-creator-canvas-wrapper">
				<div
					className="building-creator-canvas"
					onMouseDown={(e) => {
						if (e.button === 0) {
							setDragPaint(PaintType.DRAWING);
						} else if (e.button === 2) {
							setDragPaint(PaintType.ERASING);
						}
					}}
					onMouseUp={(e) => {
						setDragPaint(PaintType.NONE);
					}}
				>
					{canvasLines}
				</div>
			</div>
		</div>
	);
}
