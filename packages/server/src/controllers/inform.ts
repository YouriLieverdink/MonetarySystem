import {Collection, Gossip, Storage} from '../services/_';
import {Computer, Event, State} from '../types/_';
import {Express} from 'express';
import {forEach, toNumber} from "lodash";

export type _State = State & {
    sender?: string;
}

export class Inform extends Gossip<_State> {

    /**
     * the votes for states
     */
    public votes = {};

    /**
     * Class construtor.
     *
     * @param computers The known computers in the network.
     * @param interval The interval at which this computer should gossip.
     * @param me This computer.
     * @param server The active express server.
     * @param storage
     */
    constructor(
        protected computers: Collection<Computer>,
        interval: number,
        me: Computer,
        server: Express,
        private storage: Storage,
    ) {
        //
        super(computers, 'inform', interval, me, server);

        this.helpers.addStates();
    }

    /**
     * This array contains all the keys the class does not wish to be send over
     * the network or to be used in equality comparisons.
     */
    public except(): string[] {
        //
        return ['date'];
    }

    /**
     * This method is called everytime the gossip service initiates a new
     * handshake with a randomly selected computer.
     */
    public onTick(): void {
        //
    }

    /**
     * This method is called whenever the gossip service has received items that
     * it did not already know.
     *
     * @param items The newly received items.
     * @param last The last item the other computer has created.
     */
    public async onItems(items: State[], last: State): Promise<void> {
        //
        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            // We only accept items we don't already know.
            if (!this.helpers.isUnknown(item)) continue;

            this.helpers.vote(items[i])
        }

        const states = this.helpers.majorityStates()
        this.helpers.handleStates(states)
    }

    /**
     * This method is called whenever the axios post request to another computer
     * throws an error.
     *
     * @param kind The kind of error that was thrown.
     * @param computer The computer to which the gossip service was communicating.
     * @param error The actual error object.
     */
    public onError(kind: string, computer: Computer, error?: Error): void {
        //
        console.log(kind, computer.ip, error.message);
    }

    /**
     * The helper methods.
     */
    public readonly helpers = {
        /**
         * Fills the items list with the states that are in the database
         */
        addStates: async (): Promise<void> => {
            const states = await this.storage.states.index();
            for (let i = 0; i < states.length; i++) {
                this.items.add({publicKey: states[i].publicKey, balance: states[i].balance, sender: this.me.ip});
            }

        },

        /**
         * checks if the items publicKey is not already in the database
         */
        isUnknown: (item: State): boolean => {
            return this.items.all().every((i) => i.publicKey !== item.publicKey);
        },

        /**
         * adds a vote to the collection
         */
        vote: (state: _State): void => {
            if (this.votes[state.publicKey] === undefined) {
                this.votes[state.publicKey] = {}
            }
            if (this.votes[state.publicKey][state.balance] === undefined) {
                this.votes[state.publicKey][state.balance] = []
            }
            if (!this.votes[state.publicKey][state.balance].includes(state.sender)) {
                this.votes[state.publicKey][state.balance].push(state.sender)
            }
        },

        /**
         * returns all states that have a majority
         */
        majorityStates: (): _State[] => {
            const votedStates = [];

            for (const publicKey in this.votes) {
                let totalLength = 0;
                let mostVotes = 0;
                let mostVotesBalance;
                for (const balance in this.votes[publicKey]) {
                    totalLength += this.votes[publicKey][balance].length
                    if (this.votes[publicKey][balance].length > mostVotes) {
                        mostVotes = this.votes[publicKey][balance].length;
                        mostVotesBalance = balance;
                    }
                }
                if (mostVotes >= ((totalLength / 3) * 2) && mostVotesBalance && totalLength >= 3) {
                    votedStates.push({publicKey: publicKey, balance: toNumber(mostVotesBalance)})
                }
            }

            return votedStates
        },

        /**
         * the states that have been chosen will be put in the item list and in the database
         */
        handleStates: async (states: _State[]): Promise<void> => {
            for (let i = 0; i < states.length; i++) {
                this.items.add(states[i])
                await this.storage.states.create(states[i])
                delete this.votes[states[i].publicKey]
            }
        }
    }

}