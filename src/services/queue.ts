
export class Queue<T> {
	/**
	 * The items currently in the queue.
	 */
	private items: T[];

	/**
	 * Class constructor.
	 */
	constructor() {
		this.items = [];
	}

	/**
	 * Pushes one or multiple items to the queue.
	 * 
	 * @param items The items to push
	 */
	public push(...items: T[]): void {
		this.items.push(...items);
	}

	/**
	 * Pops one or multiple items from the queue.
	 * 
	 * @param number The number of items to pop. 0 can be used to pop all items.
	 */
	public pop(number = 1): T[] {
		let items = [];

		if (number === 0) {
			// Return all the items.
			items = this.items;
			this.items = [];
		}
		else {
			for (let i = 0; i < number; i++) {
				const event = this.items.shift();

				if (event === undefined) break;

				items.push(event);
			}
		}

		return items;
	}

	/**
	 * Returns the current length of the queue.
	 */
	public length(): number {
		return this.items.length;
	}
}