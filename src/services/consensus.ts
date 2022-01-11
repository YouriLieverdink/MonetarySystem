import { Crypto } from '../services';
import { Event, Header } from '../types';
import publicIp from 'public-ip';

export class Consensus<T> {
    /**
     * Used for cryptography.
     */
    private crypto: Crypto;

    /**
     * The events to which consensus has not been reached.
     */
    private events: Header[];


    /**
     * Class constructor.
     * 
     * @param crypto The crypto service.
     */
    constructor(
        crypto?: Crypto,
    ) {
        //
        this.crypto = crypto || new Crypto();
    }

    /**
     * Performs the consensus algorithm.
     *
     * @param events The current events.
     * @param n The number of peers in the network.
     * @returns Events on which consensus has been reached.
     */
    public doConsensus(events: Header[], n: number): Header[] {
        //
        events.push(...this.events);

        events = this.divideRounds(events, n);
        events = this.decideFame(events);
        events = this.findOrder(events);

        return events;
    }

    /**
     * Performs the first step of the consensus algorithm, division into rounds.
     * This method is responsible for assigning a round number to every event
     * and determining whether it is a witness or not.
     *
     * @param events The current events.
     * @param n
     * @returns Events divided into rounds.
     */
    public divideRounds(events: Header[], n: number): Header[] {
        events.forEach((event) => {
            if (!event.round) {
                event.round = this.helpers.round(events, event, n);
            }
            event.witness = this.helpers.witness(events, event);
        });

        return events;
    }

    /**
     * Performs the second step of the consensus algorithm, determining whether
     * a witness event is famous or not.
     * 
     * @param events The current events.
     * @returns Events which have received fame when necessary.
     */
    private decideFame(events: Header[]): Header[] {
        //
        return events;
    }

    /**
     * Performs the third an last step of the consensus algorithm, finding order
     * using the famous witnesses in the hashgraph.
     * 
     * @param events The current events.
     * @returns Events which have been ordered.
     */
    private findOrder(events: Header[]): Header[] {
        //
        return events;
    }

    /**
     * The helper methods.
     */
    public readonly helpers = {
        /**
         * Returns true when x can see y which means that y is an ancestor of x.
         * 
         * @param events The available events.
         * @param x The current event.
         * @param y The event we are trying to see.
         * @returns Whether x can see y.
         */
        canSee: (
            events: Header[],
            x: Header,
            y: Header
        ): boolean => {
            //
            if (x === y) return true;

            if (!x.body.otherParent && !x.body.selfParent) {
                // Genesis events don't have parents, sad :(
                return false;
            }

            const selfParent = this.helpers.selfParent(events, x);
            if (selfParent === y) return true;

            const otherParent = this.helpers.otherParent(events, x);
            if (otherParent === y) return true;

            // Recursive calls to see whether it is the parent of the parent.
            return (
                this.helpers.canSee(events, selfParent, y) ||
                this.helpers.canSee(events, otherParent, y)
            );
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
            events: Header[],
            x: Header,
            y: Header,
            n: number
        ): boolean => {
            //
            const computers = new Set<string>();

            const dfs = (path: Header[]): Header[][] => {
                const x = path[path.length - 1];
                let paths: Header[][] = [];

                if (x === y) return [path];

                // Retrieve the parents for the current event.
                const parents: Header[] = this.helpers.parents(events, x);

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
                computers.add(event.body.publicKey);
            }));

            return this.helpers.superMajority(n, computers.size);
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
            events: Header[],
            x: Header,
            kind: 'selfParent' | 'otherParent',
        ): Header => {
            //
            const match = (event: Header) => {
                return x.body[kind] === this.crypto.createHash(event.body);
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
            events: Header[],
            x: Header,
        ): Header[] => {
            //
            return ['selfParent', 'otherParent'].map((kind) => {
                return this.helpers[kind](events, x);
            });
        },
        /**
         * Returns the self parent for the provided event.
         * 
         * @param events The available events.
         * @param x The event to return the parent for.
         * @returns The self parent.
         */
        selfParent: (events: Header[], x: Header): Header => {
            //
            return this.helpers.parent(events, x, 'selfParent');
        },
        /**
         * Returns the other parent for the provided event.
         * 
         * @param events The available events.
         * @param x The event to return the parent for.
         * @returns The other parent.
         */
        otherParent: (events: Header[], x: Header): Header=> {
            //
            return this.helpers.parent(events, x, 'otherParent');
        },

        /**
         * Calculates the round of a transaction
         * @param events All events in the queue that
         * @param event
         * @param n The number of participating computers.
         * @returns returns all events with a round number
         */
        round: (events: Header[], event: Header, n: number): number => {
            let parentRound = -1;

            if (this.helpers.selfParent(events, event)) {
                const selfParent = this.helpers.parent(events, event, 'selfParent');
                parentRound = selfParent.round;
            }

            if (this.helpers.parent(events, event, 'otherParent')) {
                const otherParent = this.helpers.parent(events, event, 'otherParent');
                const opRound = otherParent.round;
                if (opRound > parentRound) {
                    parentRound = opRound;
                }
            }

            if (parentRound === -1) {
                return 0;
            }

            let round = parentRound;

            //look at parent round and count strongly seen witnesses (dit is nog niet zo mooi moet anders)
            const parentRoundEvents = this.helpers.getRoundEvents(events, parentRound);
            const parentRoundWitnesses = this.helpers.getRoundWitnesses(events, parentRound);

            let c = 0;
            parentRoundWitnesses.forEach(function (value) {
                const ss = this.canStronglySee(parentRoundEvents, event, value, n);
                if (ss) {
                    c++;
                }
            });

            // If there is a super-majority of strongly-seen witnesses, increment the
            // round
            if (this.helpers.superMajority(n, c)) {
                round++;
            }
            return round;
        },

        /**
         * Returns the events of a specific round
         *
         * @returns boolean true if x sees y
         * @param events
         * @param round
         */
        getRoundEvents: (events: Header[], round: number): Header[] => {
            return events.filter(element => element.round = round);
        },

        /**
         * Returns the witnesses of a specific round
         *
         * @returns Event<T>[] list of witnesses from specific round
         * @param events
         * @param round
         */
        getRoundWitnesses: (events: Header[], round: number): Header[] => {
            const roundEvents = this.helpers.getRoundEvents(events, round);
            return roundEvents.filter(element => element.witness === true);
        },

        /**
         * Determines if the number is a super majority (+2/3)
         *
         * @returns boolean true if x sees y
         * @param events
         * @param event
         */
        witness: (events: Header[], event: Header): boolean => {
            const xRound = event.round;
            let spRound = -1;
            if (this.helpers.selfParent(events, event) !== undefined){
                spRound = this.helpers.selfParent(events, event).round;
            }

            return xRound > spRound;
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
        }
    };
}