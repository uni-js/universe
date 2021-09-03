import React from 'react';
import classnames from 'classnames';
import { PlayerInventoryInfo } from '../shared/store';
import { useData } from './entry';
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
	const inventoryInfo = useData(PlayerInventoryInfo);
	const blocks = [];

	if (inventoryInfo) {
		for (let i = 0; i < SHORTCUT_SIZE; i++) {
			const isCurrent = i == inventoryInfo.currentIndexAt;
			const clsName = classnames({ 'shortcut-block': true, 'shortcut-block-highlight': isCurrent });
			blocks[i] = <div className={clsName} />;
		}
	}

	return (
		<div className="shortcut-wrapper">
			<div className="shortcut-blank">{blocks}</div>
		</div>
	);
}
