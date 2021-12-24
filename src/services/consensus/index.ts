import { Event } from '../../types';

export class ConsensusService {
	/**
	 * Initiate a new Consensus calculation.
	 */
	public doConsensus(events: Event[]): Event[] {
		const divided = this.divideRounds(events);
		const decided = this.decideFame(divided);
		return this.findOrder(decided);
	}

	/**
	 * Divide all known transactions into rounds
	 * @param events All events in the queue that
	 * @returns returns all events with a round number
	 */
	private divideRounds(events: Event[]): { 'round': number, 'event': Event, 'witness': boolean }[] {
		/**
		 * Steps for all events in the list:
		 * 1. Determine event round
		 * 2. Determine if event is witness
		 */

		throw Error('Not implemented');
	}

	/**
	 *  Decide if the first events by each member in each round (the “witnesses”) are famous or not
	 *
	 * @param divided All events divided in a round
	 * @returns returns all events with a boolean if the event is famous or not
	 */
	private decideFame(divided): { 'round': number, 'event': Event, 'witness': boolean, 'famous': boolean }[] {
		/**
		 * Steps for all events that are a witness:
		 * 1. Vote for every other events
		 * 2. if super majority, then decide
		 * 3. else just vote
		 * 4. if coin round: if super majority vote else flip a coin
		 */

		throw Error('Not implemented');
	}

	/**
	 * Find the total order for the events for which enough information is available
	 *
	 * @param decided All events decided if they are famous or not
	 * @returns returns all events ordered by round and timestamp
	 */
	private findOrder(decided): Event[] {
		/**
		 * Steps:
		 * 1. unique famous witnesses assign a consensus timestamp
		 * 2. timestamp is median of timestamp when each witness received the event
		 * 3. sort by round
		 * 4. sort by timestamp
		 */

		throw Error('Not implemented');
	}

	/**
	 * The core methods.
	 */
	public readonly core = {
		/**
		 * Determines if y is an ancestor of x
		 *
		 * @param x event
		 * @param y event
		 * @returns boolean true if event y is an ancestor of event x
		 */
		ancestor: (x: Event, y: Event): boolean => {

			throw Error('Not implemented');
		},
		/**
		 * Determines if event y is a self-ancestor of event x
		 *
		 * @param x event
		 * @param y event
		 * @returns boolean true if y is a self-ancestor of x
		 */
		selfAncestor: (x: Event, y: Event): boolean => {

			throw Error('Not implemented');
		},
		/**
		 * Determines if event x can see event y
		 *
		 * @param x event
		 * @param y event
		 * @returns boolean true if x sees y
		 */
		see: (x: Event, y: Event): boolean => {

			throw Error('Not implemented');
		},
		/**
		 * Determines if event x can strongly see event y
		 *
		 * @param x event
		 * @param y event
		 * @param set list of events of a round
		 * @returns boolean true if x strongly sees y
		 */
		stronglySee: (x: Event, y: Event, set: Event[]): boolean => {

			throw Error('Not implemented');
		},
	};
}