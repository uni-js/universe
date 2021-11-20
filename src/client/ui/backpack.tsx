import React from 'react';
import { useTexturePath, useTextureProvider, useUIState } from '../../framework/client-side/user-interface/hooks';
import { BackpackContainerState } from '../module/inventory-module/ui-state';
import './backpack.css';

export function Backpack() {
	const container = useUIState(BackpackContainerState);
	const provider = useTextureProvider();

	const blockElems = [];
	for (const block of container.blocks) {
		const path = useTexturePath(provider, `item.${block.itemType}.normal`);
		blockElems.push(
			<div className="backpack-block">
				<img src={path} />
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
