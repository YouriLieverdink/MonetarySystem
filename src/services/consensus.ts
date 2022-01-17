import { Crypto } from '../services';
import { Event } from '../types';

export class Consensus<T> {
    /**
     * Used for cryptography.
     */
    private crypto: Crypto;

    /**
     * The events to which consensus has not been reached.
     */
    private events: Event<T>[];

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
        this.events = [];
    }

    /**
     * Performs the consensus algorithm.
     * 
     * @param events The current events.
     * @returns Events on which consensus has been reached.
     */
    public doConsensus(events: Event<T>[]): Event<T>[] {
        //
        events.push(...this.events);

        events = this.divideRounds(events);
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
     * @returns Events divided into rounds.
     */
    private divideRounds(events: Event<T>[]): Event<T>[] {
        //
        return events;
    }

    /**
     * Performs the second step of the consensus algorithm, determining whether
     * a witness event is famous or not.
     * 
     * @param events The current events.
     * @returns Events which have received fame when necessary.
     */
    private decideFame(events: Event<T>[]): Event<T>[] {
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
    private findOrder(events: Event<T>[]): Event<T>[] {
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
            events: Event<T>[],
            x: Event<T>,
            y: Event<T>
        ): boolean => {
            //
            if (x === y) return true;

            if (!x.otherParent && !x.selfParent) {
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
            events: Event<T>[],
            x: Event<T>,
            y: Event<T>,
            n: number
        ): boolean => {
            //
            const computers = new Set<string>();

            const dfs = (path: Event<T>[]): Event<T>[][] => {
                const x = path[path.length - 1];
                let paths: Event<T>[][] = [];

                if (x === y) return [path];

                // Retrieve the parents for the current event.
                const parents: Event<T>[] = this.helpers.parents(events, x);

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
                computers.add(event.publicKey);
            }));

            return computers.size >= (2 * n) / 3;
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
            events: Event<T>[],
            x: Event<T>,
            kind: 'selfParent' | 'otherParent',
        ): Event<T> => {
            //
            const match = (event: Event<T>) => {
                return x[kind] === this.crypto.createHash(event);
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
            events: Event<T>[],
            x: Event<T>,
        ): Event<T>[] => {
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
        selfParent: (events: Event<T>[], x: Event<T>): Event<T> => {
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
        otherParent: (events: Event<T>[], x: Event<T>): Event<T> => {
            //
            return this.helpers.parent(events, x, 'otherParent');
        }
    };
}