import { Service } from 'typedi';
import { Event } from '../../types';

@Service()
export class QueueService {
	/**
	 * The events currently in the queue.
	 */
	private events: Event[];

	/**
	 * Class constructor.
	 */
	constructor() {
		this.events = [];
	}

	/**
	 * Pushes one or multiple events to the queue.
	 * 
	 * @param events The events to push
	 */
	public push(...events: Event[]): void {
		this.events.push(...events);
	}

	/**
	 * Pops one or multiple events from the queue.
	 * 
	 * @param number The number of events to pop. 0 can be used to pop all events.
	 */
	public pop(number = 1): Event[] {
		let events = [];

		if (number === 0) {
			// Return all the events.
			events = this.events;
			this.events = [];
		}
		else {
			for (let i = 0; i < number; i++) {
				const event = this.events.shift();

				if (event === undefined) break;

				events.push(event);
			}
		}

		return events;
	}

	/**
	 * Returns the current length of the queue.
	 */
	public length(): number {
		return this.events.length;
	}
}