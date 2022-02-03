import { Transaction } from "../types/transaction";
import { _Event } from "./consensus";
import { Storage } from "./storage";

export class Digester {
    /**
     * Class constructor.
     * 
     * @param storage The interface for the database.
     */
    constructor(private storage: Storage) { }

    /**
     * Digests all the events on which consensus has been reached.
     *
     * @param events All events that are not yet processed. 
     */
    public async do(events: _Event<Transaction[]>[]): Promise<void> {
        // Ensure the events are processed in the right order.
        events.sort((a, b) => a.index - b.index);

        for (let i = 0; i < events.length; i++) {
            //
            const event = events[i];
            await this.handleEvent(event);
        }
    }

    /**
     * Extracts and processes the transactions from an event.
     *
     * @param event The event to process.
     */
    private async handleEvent(event: _Event<Transaction[]>): Promise<void> {
        //
        if (!event.data) return;

        // We need the last index to start counting from.
        const last = await this.storage.transactions.index(null, 1);
        let index = last[0]?.index || 0;

        for (const transaction of event.data) {
            // We need to balance to verify whether a user can transfer funds.
            const transactions = await this.storage.transactions.index(transaction.sender);

            const balance = transactions
                .map((transaction) => transaction.amount)
                .reduce((p, c) => p + c, 0);

            const isValid = await this.helpers.isValid(balance, transaction, event.publicKey);

            if (isValid) {
                //
                transaction.index = index += 1;
                transaction.timestamp = event.timestamp;

                await this.storage.transactions.create(transaction);
            }
        }
    }

    /**
     * The helper methods.
     */
    private readonly helpers = {
        /**
         * Checks if a transaction can be made.
         * 
         * @param balance The current balance of `sender`.
         * @param transaction The transaction in question.
         * @param creator The creator of the event which held the transaction.
         */
        isValid: async (balance: number, transaction: Transaction, creator: string): Promise<boolean> => {
            //
            if (transaction.sender === `~`) {
                // TODO: Validate whether user can receive a coin again.
                return true;
            }

            if (transaction.amount > balance) {
                return false;
            }

            return true;
        },
    };
}