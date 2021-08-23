import { BrickType } from '../brick/types';

/**
 * 使用物品的指令
 */
export interface UseItemInstruction {}

export class PlaceBrickInstruction implements UseItemInstruction {
	constructor(public brickType: BrickType) {}
}

/**
 * 消耗物品的指令
 */
export class ConsumeInstruction implements UseItemInstruction {
	constructor(
		/**
		 * 消耗的数量
		 */
		public amount: number,
	) {}
}

/**
 * 消耗耐久的指令
 */
