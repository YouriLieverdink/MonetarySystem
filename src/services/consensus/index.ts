import { Event, Node } from '../../types';
import { createHash } from 'crypto';

export class ConsensusService {

    /**
     * The events to which consensus has not been reached.
     */
    private events: Event[];

    /**
     * The events to which consensus has not been reached.
     */
    private n: number;

    /**
     * The events divided into rounds.
     */
    private roundCache: { 'round': number, 'events': Event[], 'consensusReached': boolean }[];

    /**
     * The events that are witness divided into rounds.
     */
    private witnessCache: { 'round': number, 'events': Event[] }[];

    /**
     * Class constructor.
     *
     * @param crypto The crypto service.
     */
    constructor() {
        this.events = [];
        this.n = 0;
    }

    /**
     * Initiate a new Consensus calculation.
     */
    public doConsensus(events: Event[], numberOfPeers: number): Event[] {
        this.events.push(...events);
        this.n = numberOfPeers;

        events = this.divideRounds(events);
        events = this.decideFame(events);
        events = this.findOrder(events);

        return events;
    }

    /**
     * Divide all known transactions into rounds
     * @param events All events in the queue that
     * @returns returns all events with a round number
     */
    private divideRounds(events: Event[]): Event[] {
        events.forEach((event) => {
            const updateEvent = false;

            if (!event.round) {
                event.round = this.core.round(events, event, this.n);
            }
            event.witness = this.core.witness(events, event);
        });

        return events;
    }


    /**
     *  Decide if the first events by each member in each round (the “witnesses”) are famous or not
     *
     * @param divided All events divided in a round
     * @returns returns all events with a boolean if the event is famous or not
     */
    private decideFame(events: Event[]): Event[] {
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
    private findOrder(events: Event[]): Event[] {
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
         * @param set
         * @returns boolean true if event y is an ancestor of event x
         */
        ancestor: (x: Event, y: Event, set: Event[]): boolean => {
            return this.core.checkAncestor(x, y, set, false);
        },

        /**
         * Determines if event y is a self-ancestor of event x
         *
         * @param x event
         * @param y event
         * @param set
         * @returns boolean true if y is a self-ancestor of x
         */
        selfAncestor: (x: Event, y: Event, set: Event[]): boolean => {
            return this.core.checkAncestor(x, y, set, true);
        },

        /**
         * Determines if y is an ancestor of x
         *
         * @param event
         * @param set
         * @param otherParent
         * @returns boolean true if event y is an ancestor of event x
         */
        getParent: (event: Event, set: Event[], otherParent: boolean): Event => {
            for (let i = 0; i < set.length; i++) {
                if (otherParent) {
                    if (String(createHash('sha256').update(JSON.stringify(set[i])).digest('hex')) === event.otherParent) {
                        return set[i];
                    }
                } else {
                    if (String(createHash('sha256').update(JSON.stringify(set[i])).digest('hex')) === event.selfParent) {
                        return set[i];
                    }
                }
            }
            return null;
        },

        /**
         * Determines if y is an ancestor of x
         *
         * @param x
         * @param y
         * @param set
         * @param selfAncestor
         * @returns boolean true if event y is an ancestor of event x
         */
        checkAncestor: (x: Event, y: Event, set: Event[], selfAncestor: boolean): boolean => {
            if (x === y) {
                return true;
            }

            let selected: Event = x;
            for (let i = 0; i < set.length; i++) {
                if (selfAncestor) {
                    if (this.core.getParent(selected, set, false)) {
                        selected = this.core.getParent(selected, set, false);
                    } else {
                        return false;
                    }
                } else {
                    if (this.core.getParent(selected, set, true)) {
                        selected = this.core.getParent(selected, set, true);
                    } else {
                        return false;
                    }
                }
                if (selected === y) {
                    return true;
                }
            }
        },

        /**
         * Determines if event x can see event y
         *
         * @param x event
         * @param y event
         * @param set list of events
         * @returns boolean true if x sees y
         */
        see: (x: Event, y: Event, set: Event[]): boolean => {
            return this.core.ancestor(x, y, set);
        },
        /**
         * Returns true when x can strongly see y which means that at least 2/3
         * of the computer's events must have been crossed.
         *
         * @param events The available events.
         * @param x The current event.
         * @param y The event we are trying to see.
         * @param n The number of participating computers.
         * @returns Whether x can strongly see y.
         */
        canStronglySee: (
            events: Event[],
            x: Event,
            y: Event,
            n: number,
        ): boolean => {
            //
            const computers = new Set<string>();

            const dfs = (path: Event[]): Event[][] => {
                const x = path[path.length - 1];
                let paths: Event[][] = [];

                if (x === y) return [path];

                // Retrieve the parents for the current event.
                const parents: Event[] = this.core.parents(events, x);

                parents.forEach((parent) => {
                    // Stop when we have reached a genesis event.
                    if (!parent) return;

                    dfs([...path, parent]).forEach((p) => {
                        paths = [...paths, p];
                    });
                });

                return paths;
            };

            const paths = dfs([x]);

            paths.forEach((path) => path.forEach((event) => {
                computers.add(event.creator);
            }));
            return this.core.superMajority(n, computers.size);
        },


        /**
         * Returns the parent event of the provided event.
         *
         * @param events The available events.
         * @param x The event to return the parent for.
         * @param kind The kind of parent to return.
         * @returns The self or other parent.
         */
        parent: (
            events: Event[],
            x: Event,
            kind: 'selfParent' | 'otherParent',
        ): Event => {
            //
            const match = (event: Event) => {
                return x[kind] === String(createHash('sha256').update(JSON.stringify(event)).digest('hex'));
            };

            return events.find(match);
        },
        /**
         * Returns both the self and other parent of x.
         *
         * @param events The available events.
         * @param x The current event.
         * @returns The parents of the current event.
         */
        parents: (
            events: Event[],
            x: Event,
        ): Event[] => {
            //
            return ['selfParent', 'otherParent'].map((kind) => {
                return this.core[kind](events, x);
            });
        },

        /**
         * Returns the self parent for the provided event.
         *
         * @param events The available events.
         * @param x The event to return the parent for.
         * @returns The self parent.
         */
        selfParent: (events: Event[], x: Event): Event => {
            //
            return this.core.parent(events, x, 'selfParent');
        },
        /**
         * Returns the other parent for the provided event.
         *
         * @param events The available events.
         * @param x The event to return the parent for.
         * @returns The other parent.
         */
        otherParent: (events: Event[], x: Event): Event => {
            //
            return this.core.parent(events, x, 'otherParent');
        },

        /**
         * Determines if the number is a super majority (+2/3)
         *
         * @returns boolean true if x sees y
         * @param computers
         * @param compare
         */
        superMajority: (computers: number, compare: number): boolean => {
            return compare >= Math.floor(2 * computers / 3 + 1);
        },

        /**
         * Calculates the round of a transaction
         * @param events All events in the queue that
         * @param event
         * @param n The number of participating computers.
         * @returns returns all events with a round number
         */
        round(events: Event[], event: Event, n: number): number {
            let parentRound = -1;

            if (this.core.parent(events, event, 'selfParent')) {
                const selfParent = this.core.parent(events, event, 'selfParent');
                parentRound = this.core.getRound(selfParent);
            }

            if (this.core.parent(events, event, 'otherParent')) {
                const otherParent = this.core.parent(events, event, 'otherParent');
                const opRound = this.core.getRound(otherParent);
                if (opRound > parentRound) {
                    parentRound = opRound;
                }
            }

            if (parentRound === -1) {
                return 0;
            }

            let round = parentRound;

            //look at parent round and count strongly seen witnesses (dit is nog niet zo mooi moet anders)
            const parentRoundEvents = this.roundCache.find(element => element.round === parentRound);
            const parentRoundWitnesses = this.witnessCache.find(element => element.round === parentRound);

            let c = 0;
            parentRoundWitnesses.events.forEach(function (value) {
                const ss = this.canStronglySee(parentRoundEvents.events, event, value, n);
                if (ss) {
                    c++;
                }
            });

            // If there is a super-majority of strongly-seen witnesses, increment the
            // round
            if (this.core.superMajority(n, c)) {
                round++;
            }
            return round;
        },

        /**
         * Gets the round of an event from the round cache
         *
         * @returns boolean true if x sees y
         * @param event
         */
        getRound: (event: Event): number => {
            this.roundCache.forEach((round) => {
                if (round.events.find(element => element === event)) {
                    return round.round;
                }
            });
            return -1;
        },

        /**
         * Determines if the number is a super majority (+2/3)
         *
         * @returns boolean true if x sees y
         * @param events
         * @param event
         */
        witness: (events: Event[], event: Event): boolean => {
            const xRound = this.core.getRound(event);
            let spRound = -1;
            if (this.core.parent(events, event, 'selfParent')){
                spRound = this.core.getRound(this.core.parent(events, event, 'selfParent'));
            }

            return xRound > spRound;
        }


    };
}