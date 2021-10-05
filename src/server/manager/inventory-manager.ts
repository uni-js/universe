import { Player } from '../entity/player';
import { BackpackMainContainer, Container, ContainerBlock, Inventory, PlayerInventory, ShortcutContainer } from '../entity/inventory';
import { PlayerManager } from './player-manager';
import { ICollection, injectCollection } from '../../shared/database/memory';
import { inject, injectable } from 'inversify';
import { GameEvent } from '../event';
import { EntityManager } from '../shared/manager';
import { BLOCKS_PER_PLAYER_INVENTORY_CONTAINER, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER, ContainerUpdateData } from '../../shared/inventory';
import { ItemType } from '../../shared/item';

@injectable()
export class InventoryManager extends EntityManager<Inventory> {
	constructor(
		@injectCollection(Container) private containerList: ICollection<Container>,
		@injectCollection(ContainerBlock) private blocksList: ICollection<ContainerBlock>,
		@injectCollection(Inventory) private inventoryList: ICollection<Inventory>,
		@injectCollection(Inventory) private playerInventoryList: ICollection<PlayerInventory>,

		@inject(PlayerManager) private playerManager: PlayerManager,
	) {
		super(inventoryList);

		this.playerManager.on(GameEvent.AddEntityEvent, this.onPlayerAdded);
		this.playerManager.on(GameEvent.RemoveEntityEvent, this.onPlayerRemoved);
	}

	addNewEmptyBlocks(containerId: number, size: number) {
		const blocks: ContainerBlock[] = [];

		for (let i = 0; i < size; i++) {
			const block = new ContainerBlock();
			block.index = i;
			block.containerId = containerId;
			blocks.push(block);
		}

		this.blocksList.insert(blocks);
	}

	setBlock(containerId: number, index: number, itemType: ItemType, count: number) {
		const block = this.blocksList.findOne({ containerId, index });
		block.itemType = itemType;
		block.itemCount = count;

		this.blocksList.update(block);

		//TODO: notify this change
	}

	private addNewShortcut() {
		const shortcut = new ShortcutContainer();
		this.containerList.insertOne(shortcut);
		this.addNewEmptyBlocks(shortcut.$loki, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER);
		return shortcut;
	}

	private addNewBackpackMain() {
		const mainContainer = new BackpackMainContainer();
		this.containerList.insertOne(mainContainer);
		this.addNewEmptyBlocks(mainContainer.$loki, BLOCKS_PER_PLAYER_INVENTORY_CONTAINER);
		return mainContainer;
	}

	private addNewPlayerInventory(playerId: number) {
		const inventory = new PlayerInventory();

		const { $loki: shortcutId } = this.addNewShortcut();
		const { $loki: mainContainerId } = this.addNewBackpackMain();

		inventory.containers = [shortcutId, mainContainerId];
		inventory.playerId = playerId;

		return this.inventoryList.insertOne(inventory);
	}

	private onPlayerAdded = (actorId: number, player: Player) => {
		const inventory = this.addNewPlayerInventory(player.$loki);

		//HACK: remove in the future
		//add player a bow in shortcut
		this.setBlock(inventory.containers[0], 0, ItemType.BOW, 1);

		this.sendInventoryUpdateData(player, inventory.$loki);
	};
	private onPlayerRemoved = (actorId: number, player: Player) => {
		const invetory = this.playerInventoryList.findOne({ playerId: actorId });
		this.removeInventory(invetory.$loki);
	};

	/**
	 * 删除一个容器
	 * 将删除它的所有格子
	 */
	private removeContainer(containerId: number) {
		this.blocksList.findAndRemove({ containerId });
	}

	/**
	 * 移除一个inventory
	 * 将删除它的所有容器
	 */
	private removeInventory(inventoryId: number) {
		const inventory = this.findEntity({ $loki: inventoryId });
		for (const containerId of inventory.containers) {
			this.removeContainer(containerId);
		}
	}

	sendInventoryUpdateData(player: Player, inventoryId: number) {
		const inventory = this.findEntity({ $loki: inventoryId });
		for (const containerId of inventory.containers) {
			this.sendContainerUpdateData(player, containerId);
		}
	}

	sendContainerUpdateData(player: Player, containerId: number) {
		const container = this.containerList.findOne({ $loki: containerId });
		const blocks = this.blocksList.find({ containerId });
		const updateData: ContainerUpdateData = { units: [] };

		for (const block of blocks) {
			updateData.units.push({
				index: block.index,
				itemType: block.itemType,
				count: block.itemCount,
			});
		}

		this.emit(GameEvent.UpdateInventoryEvent, updateData, container, true, player);
	}

	getPlayerInventory(player: Player) {
		return this.playerInventoryList.findOne({ playerId: player.$loki });
	}
}
