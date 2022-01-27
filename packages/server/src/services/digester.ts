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

            await this.handleTransactions(event.data)


            if (await this.mirrorIsActive()) {
                this.mirror(event);
            }
        }
    }

    /**
     * handles all the transactions from an event
     *
     * @param transactions
     *
     */
    public async handleTransactions(transactions: Transaction[]): Promise<void> {

        for (let i = 0; i < transactions.length; i++) {
            const from = await this.storage.states.read(transactions[i].from)
            const to = await this.storage.states.read(transactions[i].to)

            if (await this.validate(from, to, transactions[i])) {
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
     */
    private async validate(from: State, to: State, transaction: Transaction): Promise<boolean> {

        if (from && to){
            if (from.balance >= transaction.amount){
                return true
            }
        }

        return false
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