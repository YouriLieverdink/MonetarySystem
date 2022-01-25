import { Crypto } from './_';
import { Event } from '../types/_';

export type cEvent<T> = Event<T> & {
    consensus?: boolean;
    round?: number;
    witness?: boolean;
    roundReceived?: number;
    famous?: boolean;
    timestamp?: Date;
}

export class Consensus<T> {
    /**
     * Used for cryptography.
     */
    private crypto: Crypto;

    /**
     * The events to which consensus has not been reached.
     */
    private events: cEvent<T>[];

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
     * @param n The number of peers in the network.
     * @returns Events on which consensus has been reached.
     */
    public doConsensus(events: cEvent<T>[], n: number): cEvent<T>[] {
        //
        events.push(...this.events);

        events = this.divideRounds(events, n);
        events = this.decideFame(events, n);
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
    public divideRounds(events: cEvent<T>[], n: number): cEvent<T>[] {
        events.forEach((event) => {
            if (!event.round) {
                let round = this.helpers.getHighestParentRound(events, event);

                if (round === -1) {
                    event.round = 0;
                } else {
                    let count = this.helpers.countStrongestSeenWitnesses(events, event, round, n);
                    if (this.helpers.superMajority(n, count)) {
                        round++;
                    }
                    event.round = round
                }
            }

            event.witness = this.witness(events, event);
        });

        return events;
    }

    /**
     * Determines if the event is a witness
     *
     * @returns boolean true if the event is a witness
     * @param events
     * @param event
     */
    public witness(events: cEvent<T>[], event: cEvent<T>): boolean {
        const round = event.round;
        let spRound = -1;
        if (this.helpers.selfParent(events, event) !== undefined) {
        spRound = this.helpers.selfParent(events, event).round;
        }

        return round > spRound;
    }

    /**
     * Performs the second step of the consensus algorithm, determining whether
     * a witness event is famous or not.
     *
     * @param events The current events.
     * @param n
     * @returns Events which have received fame when necessary.
     */
    private decideFame(events: cEvent<T>[], n: number): cEvent<T>[] {
        //
        this.fameHelpers.fame(events, n);
        return events;
    }

    /**
     * Performs the third an last step of the consensus algorithm, finding order
     * using the famous witnesses in the hashgraph.
     * 
     * @param events The current events.
     * @returns Events which have been ordered.
     */
    public findOrder(events: cEvent<T>[]): cEvent<T>[] {
        //
        events.forEach((x) => {
            // Set the initial round to r+1 because the witnesses in r never can see x.
            let r = x.round + 1;
            let famousWitnesses: cEvent<T>[];

            for (; ;) {
                // We can continue with at least one witness in r.
                const witnesses = events.filter((y) => y.round === r && y.witness);
                if (witnesses.length === 0) break;

                // Fame has to be decided on the witnesses before we can continue.
                const isFameDecided = witnesses.every((y) => y.famous !== undefined);
                if (!isFameDecided) break;

                // We only need to famous witnesses to determine the round received.
                famousWitnesses = witnesses.filter((y) => y.famous);

                // The round received is the first r where all famous witnesses can see x.
                const isSeenByFamous = famousWitnesses.every((y) => {
                    return this.helpers.canSee(events, y, x);
                });

                if (isSeenByFamous) {
                    // Event x is seen by all famous witnesses in r.
                    x.roundReceived = r;
                    break;
                }

                // Check the following round.
                r++;
            }

            // We need the round received to determine the median timestamp.
            if (!x.roundReceived) return;

            // We need to find the first events who saw x and are self-ancestors of a famous witness.
            const sEvents = famousWitnesses.map((y) => {
                //
                const move = (c: cEvent<T>): cEvent<T> => {
                    const selfParent = this.helpers.selfParent(events, c);

                    if (!selfParent || !this.helpers.canSee(events, selfParent, x)) {
                        // The current event is the last which was able to see x.
                        return c;
                    }

                    // The current event can still see x, we continue one down.
                    return move(selfParent);
                };

                return move(y);
            });

            // Calculate and set the median timestamp.
            const dates = sEvents.map((y) => y.createdAt.getTime());
            x.timestamp = new Date(this.core.median(dates));
        });

        return events;
    }

    /**
     * The core methods.
     */
    public readonly core = {
        /**
         * Creates a memoizes function of the provided function.
         * 
         * @param fn The function to memoize.
         */
        memoize: <R, T extends (...args) => R>(fn: T): T => {
            const cache: { [key: string]: R } = {};

            const callable = (...args) => {
                const key = JSON.stringify(args);

                if (!cache[key]) {
                    cache[key] = fn(...args);
                }

                return cache[key];
            };

            return callable as T;
        },
        /**
         * Returns the median of the provided items and `null` when the array
         * is empty.
         * 
         * @param items The items to calculate the median for.
         */
        median: (items: number[]): number | null => {
            //
            if (items.length === 0) return null;

            const middle = (items.length + 1) / 2;

            const sorted = [...items].sort((a, b) => a - b);
            const isEven = sorted.length % 2 === 0;

            return isEven
                ? (sorted[middle - 1.5] + sorted[middle - 0.5]) / 2
                : sorted[middle - 1];
        }
    };

    /**
     * The helper methods.
     */
    public readonly helpers = {
        /**
         * Returns true when y is a self ancestor of x.
         * 
         * @param events The available events.
         * @param x The current event.
         * @param y The event we are checking.
         */
        selfAncestor: this.core.memoize((
            events: cEvent<T>[],
            x: cEvent<T>,
            y: cEvent<T>,
        ): boolean => {
            //
            if (x === y) return true;

            if (!x.otherParent && !x.selfParent) {
                // Genesis events don't have parents, sad :(
                return false;
            }

            const selfParent = this.helpers.selfParent(events, x);
            if (selfParent === y) return true;

            return this.helpers.selfAncestor(events, selfParent, y);
        }),

        /**
         * Returns true when x can see y. This means that y is an ancestor of x.
         * 
         * @param events The available events.
         * @param x The current event.
         * @param y The event we are trying to see.
         */
        canSee: this.core.memoize((
            events: cEvent<T>[],
            x: cEvent<T>,
            y: cEvent<T>,
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
        }),
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
        canStronglySee: this.core.memoize((
            events: cEvent<T>[],
            x: cEvent<T>,
            y: cEvent<T>,
            n: number
        ): boolean => {
            //
            const computers = new Set<string>();

            const dfs = (path: cEvent<T>[]): cEvent<T>[][] => {
                const x = path[path.length - 1];
                let paths: cEvent<T>[][] = [];

                if (x === y) return [path];

                // Retrieve the parents for the current event.
                const parents: cEvent<T>[] = this.helpers.parents(events, x);

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

            return this.helpers.superMajority(n, computers.size);
        }),
        /**
         * Returns the parent event of the provided event.
         * 
         * @param events The available events.
         * @param x The event to return the parent for.
         * @param kind The kind of parent to return.
         * @returns The self or other parent.
         */
        parent: this.core.memoize((
            events: cEvent<T>[],
            x: cEvent<T>,
            kind: 'selfParent' | 'otherParent',
        ): cEvent<T> => {
            //
            const match = (event: cEvent<T>) => {
                return x[kind] === this.crypto.createHash(event, [
                    'consensus',
                    'round',
                    'witness',
                    'roundReceived',
                    'famous',
                    'timestamp'
                ]);
            };

            return events.find(match);
        }),
        /**
         * Returns both the self and other parent of x.
         * 
         * @param events The available events.
         * @param x The current event.
         * @returns The parents of the current event.
         */
        parents: this.core.memoize((
            events: cEvent<T>[],
            x: cEvent<T>,
        ): cEvent<T>[] => {
            //
            const parents: cEvent<T>[] = [];

            ['selfParent', 'otherParent'].forEach((kind) => {
                const parent = this.helpers[kind](events, x);

                if (parent) parents.push(parent);
            });

            return parents;
        }),
        /**
         * Returns the self parent for the provided event.
         * 
         * @param events The available events.
         * @param x The event to return the parent for.
         * @returns The self parent.
         */
        selfParent: this.core.memoize((events: cEvent<T>[], x: cEvent<T>): cEvent<T> => {
            //
            return this.helpers.parent(events, x, 'selfParent');
        }),
        /**
         * Returns the other parent for the provided event.
         * 
         * @param events The available events.
         * @param x The event to return the parent for.
         * @returns The other parent.
         */
        otherParent: this.core.memoize((events: cEvent<T>[], x: cEvent<T>): cEvent<T> => {
            //
            return this.helpers.parent(events, x, 'otherParent');
        }),
        /**
         * Determines if the number is a super majority (+2/3)
         *
         * @returns boolean if the compare number is a supermajority this depends on the number of nodes/computers
         * @param computers
         * @param compare
         */
        superMajority: this.core.memoize((computers: number, compare: number): boolean => {
            return compare >= Math.floor(2 * computers / 3 + 1);
        }),
        /**
         * Returns the events of a specific round
         *
         * @returns boolean true if x sees y
         * @param events
         * @param round
         */
        getRoundEvents: this.core.memoize((events: cEvent<T>[], round: number): cEvent<T>[] => {
            return events.filter(element => element.round === round);
        }),
        /**
         * Returns the witnesses of a specific round
         *
         * @returns Event<T>[] list of witnesses from specific round
         * @param events
         * @param round
         */
        getRoundWitnesses: this.core.memoize((events: cEvent<T>[], round: number): cEvent<T>[] => {
            const roundEvents = this.helpers.getRoundEvents(events, round);
            return roundEvents.filter(element => element.witness === true);
        }),

        /**
         * returns the number of different nodes in a round.
         * @param events
         * @param round
         * @returns returns the amount of nodes
         */
        numberOfNodes: (events: cEvent<T>[], round: number): number => {
            const nodes = [];

            for (let i = 0; i < events.length; i++) {
                if (events[i].publicKey !== undefined && !nodes.includes(events[i].publicKey) && events[i].round === round) {
                    nodes.push(events[i].publicKey);
                }
            }

            return nodes.length;
        },

        /**
         * Return round of parent with the highest round
         * @param events All events in the queue that
         * @param event
         * @returns returns round number
         */
        getHighestParentRound: this.core.memoize((events: cEvent<T>[], event: cEvent<T>): number => {
            let round = -1;

            if (this.helpers.selfParent(events, event)) {
                round = this.helpers.selfParent(events, event).round;
            }

            if (this.helpers.otherParent(events, event)) {
                const opRound = this.helpers.otherParent(events, event).round;
                if (opRound > round) {
                    round = opRound;
                }
            }
            return round;
        }),
        /**
         * Counts strongly seen witnesses in a round
         * @param events
         * @param event
         * @param round
         * @param n The number of participating computers.
         * @returns The number strongly seen witnesses
         */
        countStrongestSeenWitnesses: this.core.memoize((events: cEvent<T>[], event: cEvent<T>, round: number, n: number): number => {
            const parentRoundEvents = this.helpers.getRoundEvents(events, round);
            const parentRoundWitnesses = this.helpers.getRoundWitnesses(events, round);

            let count = 0;
            for (let i = 0, len = parentRoundWitnesses.length; i < len; i++) {
                const ss = this.helpers.canStronglySee(parentRoundEvents, event, parentRoundWitnesses[i], this.helpers.numberOfNodes(parentRoundEvents, round));
                if (ss) {
                    count++;
                }
            }
            return count;
        }),
    };

    public readonly fameHelpers = {
        /**
         * decide if witnesses are famous
         * @param events
         * @param n The number of participating computers.
         * @returns returns all events with a round number
         */
        fame: (events: cEvent<T>[], n: number): cEvent<T>[] => {
            const votes = {}; //votes[x][y] = vote;

            function vote(xID: string, yID: string, vote: boolean) {
                if (votes[xID] === undefined) {
                    votes[xID] = {};
                }
                votes[xID][yID] = vote;
            }

            const pendingRounds = this.fameHelpers.pendingRounds(events);

            //for every undecided round r
            for (let r = 0; r < pendingRounds.length; r++) {
                const pendingRound = pendingRounds[r];
                const roundWitnesses = this.helpers.getRoundWitnesses(events, pendingRound); //get all witnesses from that round r

                //for every witness - x
                for (let x = 0; x < roundWitnesses.length; x++) {
                    const witness = roundWitnesses[x];

                    if (witness.famous !== undefined) {
                        continue; //if it is decided continue
                    }

                    //The vote loop. Should check for the oldest known round may need to be changed later.
                    // This is done to check all the rounds before the round that is being checked
                    voteLoop:
                    for (let j = pendingRound + 1; j <= Math.max(...pendingRounds); j++) {
                        const comparingWitnesses = this.helpers.getRoundWitnesses(events, j); //get all witnesses from that round j
                        for (let y = 0; y < comparingWitnesses.length; y++) {
                            const comparingWitness = comparingWitnesses[y];
                            const diff = j - pendingRound;

                            if (diff === 1) {
                                vote(comparingWitness.id, witness.id, this.helpers.canSee(events, comparingWitness, witness));
                            } else {
                                const jPrevRoundWitnesses = this.helpers.getRoundWitnesses(events, j - 1);
                                const jPrevRoundEvents = this.helpers.getRoundEvents(events, j - 1);

                                // collection of witnesses from round j-1 that are
                                // strongly seen by y, based on round j-1 PeerSet.
                                const ssWitnesses = [];
                                for (let w = 0; w < jPrevRoundWitnesses.length; w++) {
                                    const jPrevRoundWitness = jPrevRoundWitnesses[w];
                                    //this should be with the amount of nodes in this spicific round. Maybe fix later.
                                    if (this.helpers.canStronglySee(events, comparingWitness, jPrevRoundWitness, n)) {
                                        ssWitnesses.push(jPrevRoundWitness);
                                    }
                                }

                                //collect votes from the ssWitnesses.
                                let yes = 0;
                                let no = 0;
                                for (let w = 0; w < ssWitnesses.length; w++) {
                                    const ssWitness = ssWitnesses[w];
                                    if (votes[ssWitness.id][witness.id]) {
                                        yes++;
                                    } else {
                                        no++;
                                    }
                                }
                                let v = false;
                                let t = no;

                                if (yes >= no) {
                                    v = true;
                                    t = yes;
                                }

                                //here comes logic for a coin round or normal round. For now only normal round
                                if (this.helpers.superMajority(this.helpers.numberOfNodes(jPrevRoundEvents, j - 1), t)) {
                                    witness.famous = v;
                                    vote(comparingWitness.id, witness.id, v);
                                    break voteLoop;
                                } else {
                                    vote(comparingWitness.id, witness.id, v);
                                }
                            }
                        }
                    }
                }
            }
            return events;
        },

        /**
         * returns list of different round numbers in events.
         * @param events
         * @returns returns list of round numbers
         */
        pendingRounds: (events: cEvent<T>[]): number[] => {
            const numbers = [];

            for (let i = 0; i < events.length; i++) {
                if (events[i].round !== undefined && !numbers.includes(events[i].round)) {
                    numbers.push(events[i].round);
                }
            }

            return numbers;
        },
    };
}