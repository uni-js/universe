import { UIState } from '../../../framework/client-side/user-interface/state';

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
