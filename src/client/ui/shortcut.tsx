import React from 'react';
import classnames from 'classnames';
import { InventoryBlockInfo, ShortcutContainerInfo } from '../shared/store';
import { useData, useDatas, useTexturePath, useTextureProvider } from './entry';
import { ContainerType } from '../../server/inventory';
import './shortcut.css';

export const SHORTCUT_SIZE = 5;

/**
 * 快捷栏的格子
 */
export function ShortcutBlock(props: any) {
	return <div className="shortcut-block"></div>;
}

export interface ShortcutProps {}
/**
 * 快捷栏
 */
export function Shortcut(props: any) {
	const shortcutInfo = useData(ShortcutContainerInfo);
	const blocks = useDatas(InventoryBlockInfo, { containerType: ContainerType.SHORTCUT_CONTAINER });
	const provider = useTextureProvider();

	const blockElems = [];

	if (shortcutInfo && blocks.length > 0) {
		for (let i = 0; i < SHORTCUT_SIZE; i++) {
			const texturePath = useTexturePath(provider, `item.${blocks[i].itemType}.normal`);
			const isCurrent = i == shortcutInfo.currentIndexAt;
			const clsName = classnames({ 'shortcut-block': true, 'shortcut-block-highlight': isCurrent });
			blockElems[i] = (
				<div className={clsName} key={i}>
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
