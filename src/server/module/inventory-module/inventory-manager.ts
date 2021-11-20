import { Player } from '../player-module/player-entity';
import { BackpackMainContainer, Container, ContainerBlock, Inventory, PlayerInventory, ShortcutContainer } from './inventory-entity';
import {
	BLOCKS_PER_PLAYER_INVENTORY_CONTAINER,
	BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER,
	ContainerType,
	ContainerUpdateData,
	MAX_STACK_SIZE,
} from './spec';
import { PlayerManager } from '../player-module/player-manager';
import { injectCollection, NotLimitCollection } from '../../../framework/server-side/memory-database';
import { inject, injectable } from 'inversify';
import { EntityManager, UpdateOnlyCollection } from '../../../framework/server-side/server-manager';
import { ItemDef, ItemDefList, ItemHoldAction, ItemType, ToolsItemTypes } from './item-entity';
import { ActorManager } from '../actor-module/actor-manager';
import { ActorFactory, ActorType, AttachType } from '../actor-module/spec';
import { DroppedItemActor } from '../pick-drop-module/dropped-item-entity';
import { Vector2 } from '../../shared/math';

import * as Events from '../../event/internal';
import { AddEntityEvent, HandleInternalEvent, RemoveEntityEvent } from '../../../framework/event';

@injectable()
export class InventoryManager extends EntityManager<Inventory> {
	constructor(
		@injectCollection(Inventory) private inventoryList: UpdateOnlyCollection<Inventory>,
		@injectCollection(Inventory) private playerInventoryList: UpdateOnlyCollection<PlayerInventory>,

		@injectCollection(Container) private containerList: NotLimitCollection<Container>,
		@injectCollection(Container) private shortcutContainerList: NotLimitCollection<ShortcutContainer>,

		@injectCollection(ContainerBlock) private blocksList: NotLimitCollection<ContainerBlock>,
		@injectCollection(ItemDef) private itemDefList: NotLimitCollection<ItemDef>,

		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,

		@inject(ActorFactory) private actorFactory: ActorFactory,
	) {
		super(inventoryList);

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
		const container = this.containerList.findOne({ $loki: containerId });
		const block = this.blocksList.findOne({ containerId, index });
		block.itemType = itemType;
		block.itemCount = count;

		this.blocksList.update(block);

		if (container.containerType === ContainerType.SHORTCUT_CONTAINER) {
			const shortcut = container as ShortcutContainer;
			if (shortcut.currentIndex === index) this.updateHoldItem(shortcut);

			const player = this.playerManager.getEntityById(shortcut.playerId);
			this.sendBlockUpdateData(player, shortcut.$loki, index);
		}

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

		return this.addNewEntity(inventory);
	}

	@HandleInternalEvent('playerManager', AddEntityEvent)
	private onPlayerAdded(event: AddEntityEvent) {
		const player = event.entity as Player;
		const inventory = this.addNewPlayerInventory(player.$loki);

		//HACK: remove in the future
		//add player a bow in shortcut
		this.setBlock(inventory.containers[0], 0, ItemType.BOW, 1);
		this.sendInventoryUpdateData(player, inventory.$loki);
	}

	@HandleInternalEvent('playerManager', RemoveEntityEvent)
	private onPlayerRemoved(event: RemoveEntityEvent) {
		const invetory = this.playerInventoryList.findOne({ playerId: event.entityId });
		this.removeInventory(invetory.$loki);
	}

	private removeContainer(containerId: number) {
		this.blocksList.findAndRemove({ containerId });
	}

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

		this.emitEvent(Events.UpdateContainerEvent, {
			playerId: player.$loki,
			containerType: container.containerType,
			updateData,
			containerId,
			isFullUpdate: true,
		});
	}

	sendBlockUpdateData(player: Player, containerId: number, indexAt: number) {
		const container = this.containerList.findOne({ $loki: containerId });
		const block = this.blocksList.findOne({ containerId, index: indexAt });

		const updateData: ContainerUpdateData = { units: [] };

		updateData.units.push({
			index: block.index,
			itemType: block.itemType,
			count: block.itemCount,
		});

		this.emitEvent(Events.UpdateContainerEvent, {
			playerId: player.$loki,
			containerType: container.containerType,
			updateData,
			containerId,
			isFullUpdate: false,
		});
	}

	private updateHoldItem(shortcut: ShortcutContainer) {
		const player = this.playerManager.getEntityById(shortcut.playerId);
		const block = this.getBlock(shortcut.$loki, shortcut.currentIndex);

		const itemDef = this.itemDefList.findOne({ itemType: block.itemType });

		this.actorManager.clearAttachments(shortcut.playerId, true);

		if (itemDef.holdAction === ItemHoldAction.ATTACH_SPEC_ACTOR) {
			const actor = this.actorFactory.getNewObject(itemDef.specActorType, []);
			actor.posX = player.posX;
			actor.posY = player.posY;

			this.actorManager.addNewEntity(actor);
			this.actorManager.setAttachment(shortcut.playerId, AttachType.RIGHT_HAND, actor.$loki);
		}
	}

	private appendItems(containerId: number, itemType: ItemType, itemCount: number): boolean {
		const blocks = this.blocksList.find({ containerId });
		for (const block of blocks) {
			if (block.itemType === itemType && block.itemCount + itemCount <= MAX_STACK_SIZE && !ToolsItemTypes.includes(itemType)) {
				this.setBlock(containerId, block.index, itemType, block.itemCount + itemCount);
				return true;
			}
			if (block.itemType === ItemType.EMPTY) {
				this.setBlock(containerId, block.index, itemType, itemCount);
				return true;
			}
		}
		return false;
	}

	setShortcutIndex(containerId: number, indexAt: number) {
		const container = this.shortcutContainerList.findOne({ $loki: containerId });
		if (indexAt == container.currentIndex) return;

		container.currentIndex = indexAt;

		this.shortcutContainerList.update(container);
		this.updateHoldItem(container);
	}

	dropContainerItem(containerId: number, indexAt: number, dropAtPos: Vector2) {
		const block = this.blocksList.findOne({ containerId, index: indexAt });
		if (block.itemType === ItemType.EMPTY) return;

		const actor = new DroppedItemActor();
		actor.itemType = block.itemType;
		actor.posX = dropAtPos.x;
		actor.posY = dropAtPos.y;

		this.actorManager.addNewEntity(actor);
		this.setBlock(containerId, indexAt, ItemType.EMPTY, 0);
	}

	pickItemsFromPos(containerId: number, pickFromPos: Vector2) {
		const radius = 0.5;
		const Xmax = pickFromPos.x + radius;
		const Xmin = pickFromPos.x - radius;
		const Ymax = pickFromPos.y + radius;
		const Ymin = pickFromPos.y - radius;

		const entities = this.actorManager.findEntities({
			type: ActorType.DROPPED_ITEM,
			posX: { $between: [Xmin, Xmax] },
			posY: { $between: [Ymin, Ymax] },
		}) as DroppedItemActor[];

		for (const entity of entities) {
			if (this.appendItems(containerId, entity.itemType, entity.itemCount)) {
				this.actorManager.removeEntity(entity);
			}
		}
	}

	getShortcut(player: Player): Readonly<ShortcutContainer> {
		const inventory = this.getPlayerInventory(player);
		const containerId = inventory.containers[0];
		return this.containerList.findOne({ $loki: containerId }) as ShortcutContainer;
	}

	getPlayerInventory(player: Player) {
		return this.playerInventoryList.findOne({ playerId: player.$loki });
	}
}
