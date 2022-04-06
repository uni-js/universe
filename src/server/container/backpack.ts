import { ContainerType } from './container-type';
import { PlayerContainer } from './player-container';

export const BACKPACK_SIZE = 20;

export class Backpack extends PlayerContainer {
	getType() {
		return ContainerType.BACKPACK;
	}

	getSize(): number {
		return BACKPACK_SIZE;
	}
}
