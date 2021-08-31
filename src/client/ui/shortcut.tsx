import React from 'react';
import './shortcut.css';

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
	return (
		<div className="shortcut-wrapper">
			<div className="shortcut-blank">{}</div>
		</div>
	);
}
