import React, { useEffect, useState } from 'react';
import { useUIState } from '../../framework/client-side/user-interface/hooks';
import { ItemType, WallpaperTypes } from '../../server/module/inventory-module/item-entity';
import { BackpackContainerState } from '../module/inventory-module/ui-state';
import { ItemBlock } from './item-block';

import './building-creator.css';

export interface BuildingCreatorProps {
	width: number;
	height: number;
	visible: boolean;
	onCloseClicked: () => void;
}

export function BuildingCreator(props: BuildingCreatorProps) {
	const [showIndex, setShowIndex] = useState<number>();
	const [index, setIndex] = useState<number>();

	const [bitmap, setBitmap] = useState<ItemType[]>([]);

	const backpack = useUIState(BackpackContainerState);
	const blockItems = [];
	const canvasLines = [];

	useEffect(() => {
		setBitmap(Array(props.width * props.height).fill(ItemType.EMPTY));
	}, []);

	function setBitmapItem(index: number, itemType: ItemType) {
		bitmap[index] = itemType;
		setBitmap({ ...bitmap });
	}

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
					index={block.index}
					key={index}
					onClick={() => {
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
					key={index}
					onClick={() => {
						setBitmapItem(blockIndex, backpack.blocks[index].itemType);
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
			<div className="building-creator-canvas">{canvasLines}</div>
		</div>
	);
}
