import { Transaction } from "../types/transaction";
import { _Event } from "./consensus";
import { Crypto } from "./crypto";
import { Storage } from "./storage";

export class Digester {
    /**
     * Class constructor.
     * 
     * @param storage The interface for the database.
     * @param crypto Used for cryptographic operations.
     */
    constructor(
        private storage: Storage,
        private crypto?: Crypto,
    ) {
        //
        this.crypto = crypto || new Crypto();
    }

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

            const isValid = await this.helpers.isValid(balance, transaction);

            if (isValid) {
                //
                transaction.index = index += 1;
                transaction.timestamp = event.timestamp;

                try {
                    await this.storage.transactions.create(transaction);
                } catch (_) { }
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
         */
        isValid: async (balance: number, transaction: Transaction): Promise<boolean> => {
            //
            if (transaction.sender === `~`) {
                // TODO: Validate whether user can receive a coin again.
                return true;
            }

            if (transaction.amount > balance) {
                return false;
            }

            // We verify the transaction signature to ensure the owner created it.
            if (!this.crypto.verifySignature(transaction, transaction.signature, transaction.sender, ['signature'])) {
                return false;
            }

            return true;
        },
    };
}