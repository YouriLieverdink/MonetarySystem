import {cEvent} from "./consensus";
import {Storage} from "./storage";
import {Transaction} from "../types/transaction";
import {State} from "../types/state";

export class Digester<T> {

    /**
     * Class constructor.
     *
     * @param storage the interface for storage
     */
    constructor(private storage: Storage) {

    }

    /**
     * Digests all the events that have reached consensus
     *
     * @param events All events that are not yet processed and have reached consensus
     *
     */
    public async digest(events: cEvent<Transaction[]>[]): Promise<void> {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            await this.handleTransactions(event.data, event.publicKey)


            if (await this.mirrorIsActive()) {
                this.mirror(event);
            }
        }
    }

    /**
     * handles all the transactions from an event
     *
     * @param transactions
     * @param creator the creator of the event
     *
     */
    public async handleTransactions(transactions: Transaction[], creator: string): Promise<void> {

        for (let i = 0; i < transactions.length; i++) {
            const from = await this.storage.states.read(transactions[i].from)
            const to = await this.storage.states.read(transactions[i].to)

            if (await this.validate(from, to, transactions[i], creator)) {
                await this.executeTransaction(from, to, transactions[i]);
            }
        }

    }

    /**
     * Checks if a transaction from a consensus event can be made
     *
     * @returns boolean if the transaction is possible return true
     *
     * @param from
     * @param to
     * @param transaction
     * @param creator the creator of the event
     */
    private async validate(from: State, to: State, transaction: Transaction, creator: String): Promise<boolean> {

        if (!from && !to){
            return false
        }

        if (from.balance < transaction.amount){
            return false
        }

        if (from.publicKey != creator){
            return false
        }

        return true
    }

    /**
     * updates the state depending on a validated transaction
     *
     *
     * @param from
     * @param to
     * @param transaction
     */
    private async executeTransaction(from: State, to: State, transaction: Transaction): Promise<void> {
        from.balance -= transaction.amount
        to.balance += transaction.amount

        await this.storage.states.update(from)
        await this.storage.states.update(to)
    }

    /**
     * checks if the mirror setting is active
     *
     * @returns whether the mirror setting is active
     *
     */
    public async mirrorIsActive(): Promise<boolean> {
        const setting = await this.storage.settings.get('mirror')
        return (setting.value === 'true');
    }

    /**
     * Makes sure all the events go in the database
     *
     * @param event
     *
     */
    public mirror(event: cEvent<Transaction[]>): void {
        //put event in database
    }


}