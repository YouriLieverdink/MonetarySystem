import { Crypto } from '../services';
import { Event } from '../types';

export type cEvent<T> = Event<T> & {
    consensus?: boolean;
    round?: number;
    witness?: boolean;
    roundReceived?: number;
    famous?: boolean;
}

//
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
                event.round = this.roundHelpers.round(events, event, n);
            }
            event.witness = this.roundHelpers.witness(events, event);
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
            // We need the witnesses of the next round to perform this step.
            let round = x.round + 1;

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const witnesses = events.filter(
                    (event) => event.round === round && event.witness,
                );

                if (witnesses.length === 0) {
                    // There are no witnesses in the next round (yet).
                    break;
                }

                const isFameDecided = witnesses.every(
                    (witness) => witness.famous !== undefined,
                );

                if (!isFameDecided) {
                    // We need all witnesses to have been decided their fame.
                    break;
                }

                // The algorithm only requires the famous witnesses to be used.
                const famousWitnesses = witnesses.filter(
                    (witness) => witness.famous,
                );

                const isSeenByFamous = famousWitnesses.every(
                    (famousWitness) => this.helpers.canSee(events, famousWitness, x),
                );

                if (isSeenByFamous) {
                    // The received round is the first round all famous witnesses can see the event.
                    x.roundReceived = round;
                    break;
                }

                // The event was not seen, maybe next round.
                round++;
            }
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
        }
    };

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
        canSee: this.core.memoize((
            events: cEvent<T>[],
            x: cEvent<T>,
            y: cEvent<T>
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
                    'famous'
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

    public readonly roundHelpers = {
        /**
         * Calculates the round of a transaction
         * @param events All events in the queue that
         * @param event
         * @param n The number of participating computers.
         * @returns returns all events with a round number
         */
        round: this.core.memoize((events: cEvent<T>[], event: cEvent<T>, n: number): number => {
            let round = this.roundHelpers.getHighestParentRound(events, event);

            if (round === -1) {
                return 0;
            }

            const count = this.roundHelpers.countStrongestSeenWitnesses(events, event, round, n);

            // If there is a super-majority of strongly-seen witnesses, increment the round
            if (this.helpers.superMajority(n, count)) {
                round++;
            }

            return round;
        }),
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
                const ss = this.helpers.canStronglySee(parentRoundEvents, event, parentRoundWitnesses[i], n);
                if (ss) {
                    count++;
                }
            }

            return count;
        }),
        /**
         * Determines if the number is a super majority (+2/3)
         *
         * @returns boolean true if x sees y
         * @param events
         * @param event
         */
        witness: this.core.memoize((events: cEvent<T>[], event: cEvent<T>): boolean => {
            const xRound = event.round;
            let spRound = -1;
            if (this.helpers.selfParent(events, event) !== undefined) {
                spRound = this.helpers.selfParent(events, event).round;
            }

            return xRound > spRound;
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

            function vote(xID: string, yID: string, vote: boolean)
            {
                if (votes[xID] === undefined){
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

                    if(witness.famous !== undefined){
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

                            if(diff === 1){
                                vote(comparingWitness.id, witness.id, this.helpers.canSee(events, comparingWitness, witness));
                            } else {
                                const jPrevRoundWitnesses = this.helpers.getRoundWitnesses(events, j-1);

                                // collection of witnesses from round j-1 that are
                                // strongly seen by y, based on round j-1 PeerSet.
                                const ssWitnesses = [];
                                for (let w = 0; w < jPrevRoundWitnesses.length; w++) {
                                    const jPrevRoundWitness = jPrevRoundWitnesses[w];
                                    //this should be with the amount of nodes in this spicific round. Maybe fix later.
                                    if(this.helpers.canStronglySee(events, comparingWitness, jPrevRoundWitness, n)){
                                        ssWitnesses.push(jPrevRoundWitness);
                                    }
                                }

                                //collect votes from the ssWitnesses.
                                let yes = 0;
                                let no = 0;
                                for (let w = 0; w < ssWitnesses.length; w++) {
                                    const ssWitness = ssWitnesses[w];
                                    if(votes[ssWitness.id][witness.id]){
                                        yes++;
                                    } else {
                                        no++;
                                    }
                                }
                                let v = false;
                                let t = no;

                                if(yes >= no){
                                    v = true;
                                    t = yes;
                                }
                                
                                //here comes logic for a coin round or normal round. For now only normal round
                                if(this.helpers.superMajority(n, t)){
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
                if(events[i].round !== undefined && !numbers.includes(events[i].round)){
                    numbers.push(events[i].round);
                }
            }
            
            return numbers;
        },

    };
}