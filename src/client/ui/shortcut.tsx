import React from 'react';
import classnames from 'classnames';
import { ShortcutContainerState } from '../module/inventory-module/ui-state';
import { useTexturePath, useTextureProvider, useUIState } from '../../framework/client-side/user-interface/hooks';

import './shortcut.css';

export const SHORTCUT_SIZE = 5;

export function ShortcutBlock(props: any) {
	return <div className="shortcut-block"></div>;
}

export interface ShortcutProps {}

export function Shortcut(props: any) {
	const shortcut = useUIState(ShortcutContainerState);
	const provider = useTextureProvider();

	const blockElems = [];

	if (shortcut && shortcut.blocks.length > 0) {
		for (let i = 0; i < SHORTCUT_SIZE; i++) {
			const texturePath = useTexturePath(provider, `item.${shortcut.blocks[i].itemType}.normal`);
			const isCurrent = i == shortcut.currentIndexAt;
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
