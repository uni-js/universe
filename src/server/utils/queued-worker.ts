export class QueuedWorker<T = any> {
	private queue: T[] = [];
	private isWorking = false;
	constructor(private callback: (data: T) => Promise<void>) {}
	async doTick() {
		if (this.queue.length <= 0) return;
		if (this.isWorking) return;

		const data = this.queue.shift();
		this.isWorking = true;
		await this.callback(data);
		this.isWorking = false;
	}

	hasTask(data: T) {
		return this.queue.includes(data);
	}

	addTask(data: T) {
		this.queue.push(data);
	}
}
