import { Player } from '../entity/player';
import { BackpackMainContainer, Container, ContainerBlock, Inventory, PlayerInventory, ShortcutContainer } from '../entity/inventory';
import { BLOCKS_PER_PLAYER_INVENTORY_CONTAINER, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER, ContainerUpdateData } from '../../server/inventory';
import { PlayerManager } from './player-manager';
import { ICollection, injectCollection } from '../../shared/database/memory';
import { inject, injectable } from 'inversify';
import { GameEvent } from '../event';
import { EntityManager } from '../shared/manager';
import { ItemDef, ItemDefList, ItemHoldAction, ItemType } from '../item';
import { ActorManager } from './actor-manager';
import { ActorFactory, AttachType } from '../actor/spec';

@injectable()
export class InventoryManager extends EntityManager<Inventory> {
	constructor(
		@injectCollection(Container) private containerList: ICollection<Container>,
		@injectCollection(Container) private shortcutContainerList: ICollection<ShortcutContainer>,

		@injectCollection(Inventory) private inventoryList: ICollection<Inventory>,
		@injectCollection(Inventory) private playerInventoryList: ICollection<PlayerInventory>,

		@injectCollection(ContainerBlock) private blocksList: ICollection<ContainerBlock>,
		@injectCollection(ItemDef) private itemDefList: ICollection<ItemDef>,

		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,

		@inject(ActorFactory) private actorFactory: ActorFactory,
	) {
		super(inventoryList);

		this.playerManager.on(GameEvent.AddEntityEvent, this.onPlayerAdded);
		this.playerManager.on(GameEvent.RemoveEntityEvent, this.onPlayerRemoved);

		this.initItemDefList();
	}

	private initItemDefList() {
		this.itemDefList.insert(ItemDefList);
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

	getBlock(containerId: number, index: number) {
		return this.blocksList.findOne({ containerId, index });
	}

	setBlock(containerId: number, index: number, itemType: ItemType, count: number) {
		const block = this.blocksList.findOne({ containerId, index });
		block.itemType = itemType;
		block.itemCount = count;

		this.blocksList.update(block);

		//TODO: notify this change
	}

	private addNewShortcut(playerId: number) {
		const shortcut = new ShortcutContainer();
		shortcut.playerId = playerId;
		this.containerList.insertOne(shortcut);
		this.addNewEmptyBlocks(shortcut.$loki, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER);
		return shortcut;
	}

	private addNewBackpackMain(playerId: number) {
		const mainContainer = new BackpackMainContainer();
		mainContainer.playerId = playerId;
		this.containerList.insertOne(mainContainer);
		this.addNewEmptyBlocks(mainContainer.$loki, BLOCKS_PER_PLAYER_INVENTORY_CONTAINER);
		return mainContainer;
	}

	private addNewPlayerInventory(playerId: number) {
		const inventory = new PlayerInventory();

		const { $loki: shortcutId } = this.addNewShortcut(playerId);
		const { $loki: mainContainerId } = this.addNewBackpackMain(playerId);

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

	private updateHoldItem(shortcut: ShortcutContainer) {
		const block = this.getBlock(shortcut.$loki, shortcut.currentIndex);

		const itemDef = this.itemDefList.findOne({ itemType: block.itemType });

		if (itemDef.holdAction === ItemHoldAction.ATTACH_SPEC_ACTOR) {
			const actor = this.actorFactory.getNewObject(itemDef.specActorType, []);

			this.actorManager.addNewEntity(actor);
			this.actorManager.setAttachment(shortcut.playerId, AttachType.RIGHT_HAND, actor.$loki);
		} else if (itemDef.holdAction === ItemHoldAction.NONE) {
			this.actorManager.clearAttachments(shortcut.playerId, true);
		}
	}

	setShortcutIndex(containerId: number, indexAt: number) {
		const container = this.shortcutContainerList.findOne({ $loki: containerId });
		container.currentIndex = indexAt;
		this.shortcutContainerList.update(container);
		this.updateHoldItem(container);
	}

	getPlayerInventory(player: Player) {
		return this.playerInventoryList.findOne({ playerId: player.$loki });
	}
}
