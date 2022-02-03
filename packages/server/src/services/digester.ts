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
        //
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

        // Calculate the current balance for the creator.
        const transactions = await this.storage.transactions.index(event.publicKey);

        // We need the latest index to create transactions from that point on.
        const index = transactions
            .map((transaction) => transaction.index)
            .reduce((p, c) => Math.max(p, c), 0);

        let balance = transactions
            .map((transaction) => transaction.amount)
            .reduce((p, c) => p + c, 0);

        for (let i = 0; i < event.data.length; i++) {
            //
            const transaction = event.data[i];

            const isValid = await this.helpers.validateTransaction(
                balance,
                transaction,
                event.publicKey,
            );

            if (isValid) {
                //
                transaction.index = index + event.index;
                transaction.order = i + 1;
                transaction.timestamp = event.timestamp;

                await this.storage.transactions.create(transaction);

                // Update the temporary balance to prevent double spending.
                balance -= transaction.amount;
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
        validateTransaction: async (balance: number, transaction: Transaction, creator: string): Promise<boolean> => {
            //
            if (transaction.sender === `~`) {
                // TODO: Validate whether user can receive a coin again.
                return true;
            }

            if (balance < transaction.amount) {
                return false;
            }

            return true;
        },
    };
}