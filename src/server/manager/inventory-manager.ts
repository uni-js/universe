import { Player } from '../entity/player';
import { Inventory, PlayerInventory } from '../entity/inventory';
import { PlayerManager } from './player-manager';
import { ICollection, injectCollection } from '../database/memory';
import { inject } from 'inversify';
import { GameEvent } from '../event';

export class InventoryManager {
	constructor(
		@injectCollection(Inventory) private inventoryList: ICollection<Inventory>,
		@injectCollection(Inventory) private playerInventoryList: ICollection<PlayerInventory>,

		@inject(PlayerManager) private playerManager: PlayerManager,
	) {
		this.playerManager.on(GameEvent.PlayerAddedEvent, this.onPlayerAdded);
		this.playerManager.on(GameEvent.PlayerRemovedEvent, this.onPlayerRemoved);
	}
	private onPlayerAdded = (player: Player) => {
		const shortcut = new PlayerInventory();
		shortcut.playerId = player.$loki;
		this.playerInventoryList.insertOne(shortcut);
	};
	private onPlayerRemoved = (player: Player) => {
		this.playerInventoryList.findAndRemove({ playerId: player.$loki });
	};
	getPlayerInventory(player: Player) {
		return this.playerInventoryList.findOne({ playerId: player.$loki });
	}
	getInventory(inventoryId: number) {
		return this.inventoryList.findOne({ $loki: inventoryId });
	}
}
