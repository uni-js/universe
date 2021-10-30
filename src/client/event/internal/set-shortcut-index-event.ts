import { InternalEvent } from '../../../framework/event';

export class SetShortcutIndexEvent extends InternalEvent {
	containerId: number;
	indexAt: number;
	itemType: string;
}
