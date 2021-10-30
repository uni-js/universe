import React from 'react';

import { BowUsingInfo } from '../store';
import { useData } from '../../framework/user-interface';

import './bow.css';
import classNames from 'classnames';

export function BowUI() {
	const usingInfo = useData(BowUsingInfo);
	if (!usingInfo) return <></>;

	return (
		<div className="bow-ui" style={{ visibility: usingInfo.isUsing ? 'visible' : 'hidden' }}>
			<div className="bow-ui-power">
				<div
					className={classNames({
						'bow-ui-progress': true,
						'bow-ui-progress-release': usingInfo.canRelease,
						'bow-ui-progress-full': usingInfo.power === 1,
					})}
					style={{ width: `${usingInfo.power * 100}%` }}
				></div>
			</div>
		</div>
	);
}
