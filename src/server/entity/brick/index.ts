import { Entity } from '../../../database/memory';

export enum BrickType {
	/**
	 * 岩石
	 *
	 * 常出现在山地
	 */
	ROCK = 'rock',

	/**
	 * 草地
	 *
	 * 常出现在平原
	 */
	GRASS = 'grass',

	/**
	 * 旱泥土地
	 *
	 * 这种草地上会长狗尾草
	 */
	DRY_DIRT = 'drydr',

	/**
	 * 普通土地
	 *
	 * 这种土地上可以长树
	 */
	DIRT = 'dirt',

	/**
	 * 湿土地
	 *
	 * 常出现在湖泊附近
	 */
	WET_DIRT = 'wetdr',

	/**
	 * 水面
	 */
	WATER = 'water',

	/**
	 * 冰面
	 */
	ICE = 'ice',

	/**
	 * 沙地
	 */
	SAND = 'sand',
}

export class Brick extends Entity {
	brickType?: BrickType;
	landLocX?: number;
	landLocY?: number;
	offLocX?: number;
	offLocY?: number;
	broken?: boolean;
}
