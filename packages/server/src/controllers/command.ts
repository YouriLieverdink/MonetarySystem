import { Express } from 'express';
import { v1 as uuidv1 } from 'uuid';
import { Api, Collection, Crypto, Storage } from "../services/_";
import { Address, Transaction } from '../types/_';

/**
 * Responsible for handling the operations requested by the user via the api
 * service.
 */
export class Command {
    /**
     * Used for cryptographic operations.
     */
    private crypto: Crypto;

    /**
     * Class constructor.
     * 
     * @param pending The collection for pending transactions.
     * @param server The active express server.
     * @param storage The interface for the database.
     */
    constructor(
        private pending: Collection<Transaction>,
        private server: Express,
        private storage: Storage,
    ) {
        //
        this.crypto = new Crypto();

        const api = new Api(this);
        this.server.all('/api/*', api.handle.bind(api));

        // Request a new coin from the network every 10 minutes.
        setInterval(
            async () => {
                //
                const value = await this.settings.get('default');
                if (!value) return;

                this.transactions.create(`~`, value, 1);
            },
            1000 * 10,
        );
    }

    /**
     * The address methods.
     */
    public readonly addresses = {
        /**
         * Gets all the stored addresses.
         */
        getAll: (): Promise<Address[]> => {
            //
            return this.storage.addresses.index();
        },
        /**
         * Creates a new address.
         */
        create: async (): Promise<Address> => {
            //
            const keys = this.crypto.createKeys();

            await this.storage.addresses.create(keys);

            // Set as default when it is the only address.
            const count = (await this.storage.addresses.index()).length;
            if (count === 1) {
                await this.storage.settings.update({ key: 'default', value: keys.publicKey });
            }

            return keys;
        },
        /**
         * Import an existing address.
         * 
         * @param privateKey The private key of the address.
         */
        import: async (privateKey: string): Promise<Address> => {
            //
            const publicKey = this.crypto.derivePublicKey(privateKey);
            const keys = { publicKey, privateKey };

            await this.storage.addresses.create(keys);

            // Set as default when it is the only address.
            const count = (await this.storage.addresses.index()).length;
            if (count === 1) {
                await this.storage.settings.update({ key: 'default', value: keys.publicKey });
            }

            return keys;
        },
        /**
         * Remove an address from this computer.
         * 
         * @param publicKey The public key of the address.
         */
        remove: async (publicKey: string): Promise<void> => {
            //
            await this.storage.addresses.destroy(publicKey);

            // If this was the last address the user had, remove the default.
            const count = (await this.storage.addresses.index()).length;
            if (count === 0) {
                await this.storage.settings.update({ key: 'default', value: '' });
            }
        }
    };

    /**
     * The transaction methods.
     */
    public readonly transactions = {
        /**
         * Gets all filtered transactions.
         * 
         * @param publicKey The sender or receiver to filter for.
         * @param limit The maximum number of transactions to return.
         * @param offset Start after `offset` + 1.
         */
        getAll: async (publicKey?: string, limit?: number, offset?: number): Promise<Transaction[]> => {
            //
            if (offset && !limit) {
                // Offset can only be used when limit is also provided.
                throw Error('Offset needs to be used in combination with limit.');
            }

            return this.storage.transactions.index(publicKey, limit, offset);
        },
        /**
         * Create a new transaction.
         * 
         * @param sender The public key of the sending address.
         * @param receiver The public key of the receiving address.
         * @param amount The amount to transfer.
         */
        create: async (sender: string, receiver: string, amount: number): Promise<Transaction> => {
            //
            const transaction: Transaction = { id: uuidv1(), sender, receiver, amount, signature: '' };

            this.pending.add(transaction);

            return transaction;
        }
    };

    /**
     * The balance methods.
     */
    public readonly balance = {
        /**
         * Calculates the balance.
         * 
         * @param publicKey The public key to calculate balance for.
         */
        get: async (publicKey?: string): Promise<number> => {
            //
            const transactions = await this.storage.transactions.index(publicKey);

            const sum = transactions
                .map((transaction) => transaction.amount)
                .reduce((p, c) => p + c, 0);

            return sum;
        },
    };

    /**
     * The settings methods.
     */
    public readonly settings = {
        /**
         * Gets the value for a given key.
         * 
         * @param key The key of the setting.
         */
        get: async (key: string): Promise<string> => {
            //
            const setting = await this.storage.settings.get(key);

            return setting?.value;
        },
        /**
         * Updates the setting for a given key.
         * 
         * @param key The key of the setting.
         * @param value The value of the setting.
         */
        update: (key: string, value: string): Promise<void> => {
            //
            return this.storage.settings.update({ key, value });
        }
    };
}