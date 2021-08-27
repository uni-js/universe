export interface ArrayDiff<T> {
	add: Array<T>;
	remove: Array<T>;
}

export function GetArrayDiff<T>(arrayBefore: Array<T>, arrayAfter: Array<T>): ArrayDiff<T> {
	const add = [];
	const remove = [];
	for (const item of arrayAfter) {
		if (!arrayBefore.includes(item)) add.push(item);
	}
	for (const item of arrayBefore) {
		if (!arrayAfter.includes(item)) remove.push(item);
	}
	return { add, remove };
}

export function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export class TaskWorker<T> {
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
	addTask(data: T) {
		this.queue.push(data);
	}
}
