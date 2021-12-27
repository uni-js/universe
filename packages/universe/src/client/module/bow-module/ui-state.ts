import { UIState } from '@uni.js/ui';

@UIState()
export class BowUsingState {
	isUsing = false;
	/**
	 * from 0 to 1
	 */
	power = 0;

	/**
	 * if a bow can be released
	 */
	canRelease = false;
}
