import { UIState } from '../../../framework/user-interface/state';

@UIState()
export class BowUsingState {
	isUsing = false;
	/**
	 * 力度, 从 0 到 1
	 */
	power = 0;

	/**
	 * 弓是否已经可以释放了
	 */
	canRelease = false;
}
