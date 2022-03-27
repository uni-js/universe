import React from 'react';
import classNames from 'classnames';

import { useUIState } from '@uni.js/ui';
import { AttachUsingState } from '../ui-states/using';

import './attach-using.css';

export function AttachUsingUI() {
	const usingInfo = useUIState(AttachUsingState);
	if (!usingInfo) return <></>;

	return (
		<div className="attach-using-ui" style={{ visibility: usingInfo.isUsing ? 'visible' : 'hidden' }}>
			<div className="attach-using-ui-power">
				<div
					className={classNames({
						'attach-using-ui-progress': true,
						'attach-using-ui-progress-release': usingInfo.approachLimit,
						'attach-using-ui-progress-full': usingInfo.power === 1,
					})}
					style={{ width: `${usingInfo.power * 100}%` }}
				></div>
			</div>
		</div>
	);
}
