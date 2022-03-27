import { UIState } from '@uni.js/ui';

@UIState()
export class AttachUsingState {
	isUsing = false;
	/**
	 * from 0 to 1
	 */
	power = 0;

	/**
	 * if approach limit
	 */
	approachLimit = false;
}
