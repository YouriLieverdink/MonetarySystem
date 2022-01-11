import { Queue } from './queue';

describe('Queue', () => {
	//
	let queue: Queue<string>;

	beforeEach(() => {
		queue = new Queue();
	});

	it('has a length of zero when first created', () => {
		const length = queue.length();
		expect(length).toBe(0);
	});

	it('has a length of one when one item has been pushed', () => {
		const items: string[] = ['schaap'];

		queue.push(...items);

		const length = queue.length();
		expect(length).toBe(1);
	});

	it('has a length of three when three items have been pushed', () => {
		const items: string[] = ['schaap', 'koe', 'varken'];

		queue.push(...items);

		const length = queue.length();
		expect(length).toBe(3);
	});

	it('returns the first item that was pushed with pop', () => {
		const items: string[] = ['schaap', 'koe', 'varken'];

		queue.push(...items);

		const item = queue.pop();
		expect(item[0]).toBe(items[0]);
	});

	it('returns all the items when the number in pop is 0', () => {
		const items: string[] = ['schaap', 'koe', 'varken'];

		queue.push(...items);

		const item = queue.pop(0);
		expect(item).toEqual(items);
	});

	it('returns an empty list when the queue is empty', () => {
		const item = queue.pop();
		expect(item).toEqual([]);
	});
});