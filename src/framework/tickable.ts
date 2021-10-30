export interface doTickable {
	/**
	 * 游戏世界的各种对象都需要在一个总时钟工作下更新
	 * 每一个时钟tick都要求所有doTickable的对象更新自己
	 * 不同的对象有不同的更新方法。
	 *
	 * 实际上相当于该对象拥有一个由总时钟驱动的定时器。
	 *
	 * @param tick 当前处于总时钟的第几个tick
	 */
	doTick(tick: number): Promise<void>;
}
