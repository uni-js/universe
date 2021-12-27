import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEventBus, useUIState } from '@uni.js/ui';
import { ItemType, WallpaperTypes } from '../../server/module/inventory-module/spec';
import { BackpackContainerState } from '../module/inventory-module/ui-state';
import { ItemBlock } from './item-block';

import './building-creator.css';
import classNames from 'classnames';
import { Range2 } from '../../server/shared/range';
import { BUILDING_BITMAP_PER_BRICK } from '../../server/module/building-module/const';

export enum PaintType {
	NONE,
	DRAWING,
	ERASING,
}

export function BuildingCreator() {
	const [visible, setVisible] = useState(false);
	const [showIndex, setShowIndex] = useState<number>();
	const [bitmap, setBitmap] = useState<ItemType[]>([]);
	const [range, setRange] = useState<Range2>();

	const backpackIndexRef = useRef<number>();
	const paintTypeRef = useRef<PaintType>(PaintType.NONE);

	const backpack = useUIState(BackpackContainerState);
	const eventBus = useEventBus();

	function clearBitmap(range: Range2 | undefined) {
		const count = range ? range.getWidth() * range.getHeight() * BUILDING_BITMAP_PER_BRICK * BUILDING_BITMAP_PER_BRICK : 0;
		setBitmap(Array(count).fill(ItemType.EMPTY));
	}

	function setBitmapItem(index: number, itemType: ItemType) {
		if (bitmap[index] === itemType) return;
		bitmap[index] = itemType;
		setBitmap({ ...bitmap });
	}

	useEffect(() => {
		const handler = (range: Range2) => {
			setVisible(true);
			setRange(range);
		};

		eventBus.on('BuildingRangeSelected', handler);
		return () => {
			eventBus.off('BuildingRangeSelected', handler);
		};
	}, []);

	useEffect(() => {
		clearBitmap(range);
	}, [range]);

	const blockItems = useMemo(() => {
		const items = [];
		let showIndexCount = 0;
		for (let i = 0; i < backpack.blocks.length; i++) {
			const block = backpack.blocks[i];
			if (WallpaperTypes.includes(block.itemType)) {
				const currentShowIndex = showIndexCount;
				const isCurrent = currentShowIndex === showIndex;
				items.push(
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
							backpackIndexRef.current = block.index;
						}}
						itemType={backpack.blocks[i].itemType}
						count={0}
						highlight={isCurrent}
					/>,
				);
				showIndexCount++;
			}
		}
		return items;
	}, [backpack.meta.revision, showIndex]);

	const canvasLines = useMemo(() => {
		if (!range) return;

		const items = [];
		const width = range.getWidth() * BUILDING_BITMAP_PER_BRICK;
		const height = range.getHeight() * BUILDING_BITMAP_PER_BRICK;

		for (let y = 0; y < height; y++) {
			const lineBlocks = [];
			for (let x = 0; x < width; x++) {
				const blockIndex = y * width + x;

				lineBlocks.push(
					<ItemBlock
						className="building-creator-canvas-block"
						containerId={backpack.containerId}
						containerType="creator-canvas"
						index={blockIndex}
						key={blockIndex}
						onLeftClick={() => {
							if (backpackIndexRef.current === undefined) return;
							setBitmapItem(blockIndex, backpack.blocks[backpackIndexRef.current].itemType);
						}}
						onRightClick={() => {
							if (backpackIndexRef.current === undefined) return;
							setBitmapItem(blockIndex, ItemType.EMPTY);
						}}
						onMouseEnter={() => {
							if (paintTypeRef.current === PaintType.DRAWING) {
								setBitmapItem(blockIndex, backpack.blocks[backpackIndexRef.current].itemType);
							} else if (paintTypeRef.current === PaintType.ERASING) {
								setBitmapItem(blockIndex, ItemType.EMPTY);
							}
						}}
						itemType={bitmap[blockIndex]}
						count={1}
						highlight={false}
					/>,
				);
			}
			items.push(<div className="building-creator-canvas-line">{lineBlocks}</div>);
		}

		return items;
	}, [range, bitmap]);

	return (
		<div className="building-creator" style={{ visibility: visible ? 'visible' : 'hidden' }}>
			<div
				className="building-creator-close"
				onClick={() => {
					eventBus.emit('SelectingBuildingRange', 'end');
					setVisible(false);
				}}
			>
				close
			</div>
			<div className="building-creator-picker">{blockItems}</div>
			<div className="building-creator-canvas-wrapper">
				<div
					className="building-creator-canvas"
					onMouseDown={(e) => {
						if (e.button === 0) {
							paintTypeRef.current = PaintType.DRAWING;
						} else if (e.button === 2) {
							paintTypeRef.current = PaintType.ERASING;
						}
					}}
					onMouseUp={(e) => {
						paintTypeRef.current = PaintType.NONE;
					}}
				>
					{canvasLines}
				</div>
			</div>
		</div>
	);
}
