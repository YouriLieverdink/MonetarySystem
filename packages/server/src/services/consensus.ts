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
        //
        events.forEach((x) => {
            //
            if (x.round) return;

            // Set the initial round to 0.
            let r = 0;

            const { selfParent, otherParent } = this.helpers.parents(events, x);

            if (selfParent && otherParent) {
                // The initial round of the event is the max of it's parents.
                r = Math.max(selfParent.round, otherParent.round);
            }

            const witnesses = events.filter((y) => {
                return y.round === r && y.witness && this.helpers.canStronglySee(events, x, y, n);
            });

            if (this.helpers.superMajority(n, witnesses.length)) {
                // The event can see the supermajority of witnesses.
                x.round = r + 1;
            } //
            else {
                x.round = r;
            }

            // The event is a witness when it has no self parent.
            if (!selfParent) {
                x.witness = true;
            } //
            else {
                x.witness = x.round > selfParent.round;
            }
        });

        return events;
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
                    const { selfParent } = this.helpers.parents(events, c);

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

            const { selfParent } = this.helpers.parents(events, x);
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

            const { selfParent, otherParent } = this.helpers.parents(events, x);
            if (selfParent === y || otherParent === y) return true;

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
                const { selfParent, otherParent } = this.helpers.parents(events, x);

                [selfParent, otherParent].forEach((parent) => {
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
         * Returns both the self and other parent of x.
         * 
         * @param events The available events.
         * @param x The current event.
         * @returns The parents of the current event.
         */
        parents: this.core.memoize((
            events: cEvent<T>[],
            x: cEvent<T>,
        ): { selfParent: cEvent<T>, otherParent: cEvent<T> } => {
            //
            const match = (event: cEvent<T>, kind: string) => {
                return x[kind] === this.crypto.createHash(
                    event,
                    ['consensus', 'round', 'witness', 'roundReceived', 'famous', 'timestamp'],
                );
            };

            return {
                selfParent: events.find((e) => match(e, 'selfParent')),
                otherParent: events.find((e) => match(e, 'otherParent')),
            };
        }),
        /**
         * Determines if the number is a super majority (+2/3)
         *
         * @returns boolean true if x sees y
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
        })
    };

    public readonly fameHelpers = {
        /**
         * decide if witnesses are famous
         * @param events
         * @param n The number of participating computers.
         * @returns returns all events with a round number
         */
        fame: (events: cEvent<T>[], n: number): cEvent<T>[] => {
            //make something to save votes
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
                                if (this.helpers.superMajority(n, t)) {
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
        }

    };
}