import { createHash } from 'crypto';
import _ from 'lodash';
import { Event } from '../types/_';

export type _Event<T> = Event<T> & {
    round?: number;
    witness?: boolean;
    vote?: boolean;
    famous?: boolean;
    roundReceived?: number;
    timestamp?: number;
    consensus?: boolean;
    index?: number;
}

export type Index<T> = {
    [hash: string]: _Event<T>;
};

export class Consensus<T> {
    /**
     * The index of events on which consensus has not been reached (yet).
     */
    private index: Index<T>;

    /**
     * Class constructor.
     */
    constructor() {
        //
        this.index = {};
    };

    /**
     * Performs the consensus algorithm.
     * 
     * @param events The available events.
     * @param n The number of computers.
     */
    public do(events: _Event<T>[], n: number): _Event<T>[] {
        //
        let index: Index<T> = {};

        index = this.createIndex(this.index, events);
        index = this.divideRounds(index, n);
        index = this.decideFame(index, n);
        index = this.findOrder(index);
        index = this.setOrder(index);

        // We update the internal state for the next `do` call.
        this.index = _.omitBy(index, (item) => item.consensus);

        return Object.values(index);
    }

    /**
     * Creates an index for all the events that have been provided. This index 
     * can be used for a faster look-up times via hash.
     * 
     * @param index The current index of events.
     * @param events The available events.
     */
    public createIndex<T>(index: Index<T>, events: _Event<T>[]): Index<T> {
        //
        index = { ...index };

        for (let i = 0; i < events.length; i++) {
            //
            const hashable = JSON.stringify(events[i]);
            const hash = createHash('sha256').update(hashable).digest('hex');

            // We set the event if we don't know it already.
            if (!(hash in index)) {
                index[hash] = events[i];
            }
        }

        return index;
    };

    /**
     * Divides the events into different rounds based on the hashgraph 
     * algorithm. This function also sets the `witness` flag in the events.
     * 
     * @param index The current index of events.
     * @param n The number of computers.
     */
    private divideRounds<T>(index: Index<T>, n: number): Index<T> {
        //
        index = { ...index };

        const events = Object.entries(index);

        for (let i = 0; i < events.length; i++) {
            //
            const [hx, ex] = events[i];

            // We skip because we have already calculated it.
            if (ex.round !== undefined) continue;

            // Round 0 is automatically assigned when it is a genesis event.
            let round = 0;
            let witness = false;

            // When there are parents, we take the max round of both.
            if (ex.selfParent && ex.otherParent) {
                //
                const self = index[ex.selfParent].round;
                const other = index[ex.otherParent].round;

                round = Math.max(self, other);
            }

            const witnesses = Object.entries(index).filter(([hy, ey]) => {
                //
                return ey.round === round && ey.witness && this.helpers.canStronglySee(index, hx, hy, n);
            });

            // This event can see more than 2/3 of the witnesses in the previous round.
            if (witnesses.length >= Math.ceil((2 * n) / 3)) {
                round++;
            }

            // Witness is automatically set to true when it is a gensis event.
            if (!ex.selfParent) {
                witness = true;
            } //
            else {
                witness = round > index[ex.selfParent].round;
            }

            index[hx] = { ...ex, round, witness };
        }

        return index;
    };

    /**
     * Decides the fame for all the witnesses. This is done based on a virtual
     * voting algorithm.
     * 
     * @param index The current index of events.
     * @param n The number of computers.
     */
    private decideFame<T>(index: Index<T>, n: number): Index<T> {
        //
        index = { ...index };

        const events = Object.entries(index);

        // We sort the event by round so we flow with time.
        events.sort((a, b) => a[1].round - b[1].round);

        for (let i = 0; i < events.length; i++) {
            //
            const [hx, ex] = events[i];

            if (ex.famous !== undefined) continue;

            yLoop:
            for (let j = 0; j < events.length; j++) {
                //
                const [hy, ey] = events[j];

                // We only decide fame for the witnesses.
                if (ex.witness && ey.witness && ey.round > ex.round) {
                    //
                    const d = ey.round - ex.round;

                    const s = events.filter(([hz, ez]) => {
                        return ez.round === (ey.round - 1) && ez.witness && this.helpers.canStronglySee(index, hy, hz, n);
                    });

                    // We calculate the votes from the events in s. +1 for true and -1 for false.
                    let yes = 0;
                    let no = 0;

                    for (let k = 0; k < s.length; k++) {
                        //
                        const [hs, _] = s[k];
                        index[hs].vote ? yes++ : no++;
                    }

                    const v = yes === no ? true : yes > no;
                    const t = v ? yes : no;

                    if (d === 1) {
                        // We vote `true` when y can see x.
                        index[hy] = { ...ey, vote: this.helpers.canSee(index, hy, hx) };
                    } //
                    else {
                        //
                        if (d % 10 > 0) {
                            // This is a normal round.
                            if (t > (2 * n) / 3) {
                                // We decide because it is the supermajority.
                                index[hx].famous = v;
                                index[hy].vote = v;

                                break yLoop;
                            } //
                            else {
                                // We can't decide yet so we just vote.
                                index[hy].vote = v;
                            }
                        } //
                        else {
                            // This is a coin round.
                            if (t > (2 * n) / 3) {
                                // We decide because it is the supermajority.
                                index[hy].vote = v;
                            } //
                            else {
                                // We don't have a supermajority so we flip a coin.
                                index[hy].vote = true;
                            }
                        }
                    }
                }
            }
        }

        return index;
    };

    /**
     * Finds the order of events using the rounds, witnesses, and fame decided
     * in the functions above.
     * 
     * @param index The current index of events.
     */
    private findOrder<T>(index: Index<T>): Index<T> {
        //
        index = { ...index };

        const events = Object.entries(index);

        for (let i = 0; i < events.length; i++) {
            //
            const [hx, ex] = events[i];

            if (ex.roundReceived !== undefined) continue;

            // Set the initial round to r+1 because the witnesses in r never can see x.
            let r = ex.round + 1;
            let famousWitnesses: [string, _Event<T>][];

            for (; ;) {
                // We can continue with at least one witness in r.
                const witnesses = events.filter(([_, ey]) => ey.round === r && ey.witness);
                if (witnesses.length === 0) break;

                // Fame has to be decided on the witnesses before we can continue.
                const isFameDecided = witnesses.every(([_, ey]) => ey.famous !== undefined);
                if (!isFameDecided) break;

                // We only need to famous witnesses to determine the round received.
                famousWitnesses = witnesses.filter(([_, ey]) => ey.famous);

                // The round received is the first r where all famous witnesses can see x.
                const isSeenByFamous = famousWitnesses.every(([hy, ey]) => {
                    return this.helpers.canSee(index, hy, hx);
                });

                if (isSeenByFamous) {
                    // Event x is seen by all famous witnesses in r.
                    index[hx] = { ...ex, roundReceived: r };
                    break;
                }

                // Check the following round.
                r++;
            }

            // We need the round received to determine the median timestamp.
            if (!index[hx].roundReceived) {
                continue;
            };

            // We need to find the first events who saw x and are self-ancestors of a famous witness.
            const s = famousWitnesses.map(([hy, ey]) => {
                //
                const move = (hc: string, ec: _Event<T>): _Event<T> => {
                    //
                    if (!ec.selfParent || !this.helpers.canSee(index, ec.selfParent, hx)) {
                        return ec;
                    }

                    return move(ec.selfParent, index[ec.selfParent]);
                };

                return move(hy, ey);
            });

            // Calculate and set the median timestamp.
            const dates = s.map((y) => y.createdAt);
            index[hx] = { ...index[hx], timestamp: this.helpers.median(dates), consensus: true };
        }

        return index;
    };

    /**
     * This methods received the index on which consensus has been reached and
     * assigns an index to every event in the correct order.
     * 
     * @param index The current index of events.
     */
    private setOrder<T>(index: Index<T>): Index<T> {
        //
        index = { ...index };

        // We only set the order on events on which consensus has been reached.
        const events = Object.entries(index).filter(([_, hx]) => hx.consensus);

        events.sort(([hx, ex], [hy, ey]) => {
            // 1. We sort by the round received.
            if (ex.roundReceived > ey.roundReceived) return 1;
            if (ex.roundReceived < ey.roundReceived) return -1;

            // 2. When that ties, we sort by the median timestamp.
            if (ex.timestamp > ey.timestamp) return 1;
            if (ex.timestamp < ey.timestamp) return -1;

            // 3. When that ties, we sort by a whithened signature.
            const random = Math.random();
            if ((parseInt(ex.signature) ^ random) > (parseInt(ey.signature) ^ random)) return 1;

            return -1;
        });

        for (let i = 0; i < events.length; i++) {
            //
            const [hx, ex] = events[i];
            index[hx] = { ...ex, index: i };
        }

        return index;
    }

    /**
     * The helper methods.
     */
    public readonly helpers = {
        /**
         * Returns `true` when x can see y.
         * 
         * @param index The current index of events.
         * @param x The current event.
         * @param y The event we are trying to see.
         */
        canSee: <T>(index: Index<T>, x: string, y: string): boolean => {
            //
            const hashes = Object.keys(index);

            /**
             * We use the breadth first search algorithm to determine whether y is an
             * ancestor of x.
             * 
             * @param x The current event.
             */
            const bfs = (visited: string[], queue: string[]): boolean => {
                //
                if (queue.length === 0) return false;

                const s = queue.pop();
                const event = index[s];

                if (!event) return false;
                if (s === y) return true;

                ['selfParent', 'otherParent'].forEach((kind) => {
                    //
                    const hash = event[kind];

                    if (hash && !visited.includes(hash) && hashes.includes(hash)) {
                        visited.push(hash);
                        queue.push(hash);
                    }
                });

                return bfs(visited, queue);
            };

            return bfs([], [x]);
        },
        /**
         * Returns `true` when x can strongly see y. This means that x can see y
         * through 2/3 of the total computers in the network.
         * 
         * @param index The current index of events.
         * @param x The current event.
         * @param y The event we are trying to strongly see.
         * @param n The number of computers.
         */
        canStronglySee: <T>(index: Index<T>, x: string, y: string, n: number): boolean => {
            //
            const hashes = Object.keys(index);

            /**
             * We use the breadth first search algorithm to find the last created event
             * for every computer in the network.
             */
            const bfs = (visited: string[], queue: string[]): string[] => {
                //
                if (queue.length === 0) return [];

                // We retrieve all the unique keys to see if we have one from every computer.
                const keys = new Set(visited.map((v) => index[v].publicKey));
                if (keys.size === n) return visited;

                const s = queue.pop();
                const event = index[s];

                ['selfParent', 'otherParent'].forEach((kind) => {
                    //
                    const hash = event[kind];

                    if (hash && !visited.includes(hash) && hashes.includes(hash)) {
                        visited.push(hash);
                        queue.push(hash);
                    }
                });

                return bfs(visited, queue);
            };

            const events = bfs([], [x]);
            if (events.length === 0) return false;

            let canStronglySee = 0;

            for (let i = 0; i < events.length; i++) {
                //
                if (this.helpers.canSee(index, events[i], y)) {
                    canStronglySee += 1;
                }
            }

            return canStronglySee >= Math.ceil((2 * n) / 3);
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
        },
    };
}