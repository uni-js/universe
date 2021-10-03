import { Entity } from '../../../shared/database/memory';

export class Inventory extends Entity {}

export class PlayerInventory extends Inventory {
	size = 5;
	currentIndex = 0;
	playerId: number;
}
