import { Express } from 'express';
import { Api, Collection, Crypto, Storage } from "../services/_";
import { Address, Setting, State, Transaction } from '../types/_';

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
    }

    /**
     * The address methods.
     */
    public readonly addresses = {
        /**
         * Gets all the stored addresses.
         */
        getAll: (): Promise<Address[]> => {
            return this.storage.addresses.index();
        },
        /**
         * Creates a new address.
         */
        create: async (): Promise<Address> => {
            const address = this.crypto.createAddress();

            // We check to see if it is the first so we can set it as default.
            const addresses = await this.storage.addresses.index();
            if (addresses.length === 0) {
                //
                await this.storage.settings.update({
                    key: 'default',
                    value: address.publicKey,
                });
            }

            await this.storage.addresses.create(address.publicKey, address.privateKey, 0);

            return address;
        },
        /**
         * Import an existing address.
         * 
         * @param privateKey The private key of the address.
         */
        import: async (privateKey: string): Promise<string> => {
            const publicKey = this.crypto.derivePublicKey(privateKey);
            await this.storage.addresses.create(publicKey, privateKey, 0);
            return publicKey;
        },
        /**
         * Remove an address from this computer.
         * 
         * @param publicKey The public key of the address.
         */
        remove: async (publicKey: string): Promise<boolean> => {
            //
            await this.storage.addresses.destroy(publicKey);

            // If this was the last address the user had, remove the default.
            const addresses = await this.storage.addresses.index();
            if (addresses.length === 0) {
                //
                await this.storage.settings.update({ key: 'default', 'value': '' });
            }

            return true;
        }
    };

    /**
     * The transaction methods.
     */
    public readonly transactions = {
        /**
         * Gets stored transactions for a given address.
         * 
         * @param publicKey The public key to retrieve the transactions for.
         */
        get: (publicKey: string): Promise<Transaction[]> => {
            return this.storage.transactions.index(publicKey);
        },
        /**
         * Gets all the transactions.
         */
        getAll: async (): Promise<Transaction[]> => {
            //
            throw Error('Not implemented');
        },
        /**
         * Gets all the stored transactions for the imported addresses.
         */
        getAllImported: async (): Promise<Transaction[]> => {
            // Return the transactions for all the user's addresses.
            const addresses = await this.storage.addresses.index();
            const transactions: Transaction[] = [];

            for (const { publicKey } of addresses) {
                transactions.push(...(await this.transactions.get(publicKey)));
            }

            return transactions;
        },
        /**
         * Create a new transaction.
         * 
         * @param from The public key of the sending address.
         * @param to The public key of the receiving address.
         * @param amount The amount to transfer.
         */
        create: async (from: string, to: string, amount: number): Promise<Transaction> => {
            await this.pending.add({ from, to, amount });
            return { from, to, amount };
        }
    };

    /**
     * The state methods.
     */
    public readonly states = {
        /**
         * Gets the state for a given address.
         * 
         * @param publicKey The public key of the address.
         */
        get: async (publicKey: string): Promise<State[]> => {
            return [await this.storage.states.read(publicKey)];
        },
        /**
         * Gets all states.
         */
        getAll: async (): Promise<State[]> => {
            return this.storage.states.index();
        },
        /**
         * Gets all states of the imported addresses.
         */
        getAllImported: async (): Promise<State[]> => {
            // Return the states for all the user's addresses.
            const addresses = await this.storage.addresses.index();
            const states: State[] = [];

            for (const { publicKey } of addresses)
                states.push(...(await this.states.get(publicKey)).filter(s => s != null));

            return states;
        }
    };

    /**
     * The settings methods.
     */
    public readonly settings = {
        /**
         * Gets the setting for a given key.
         * 
         * @param key The key of the setting.
         */
        get: (key: string): Promise<Setting> => {
            return this.storage.settings.get(key);
        },
        /**
         * Updates the setting for a given key.
         * 
         * @param key The key of the setting.
         * @param value The value of the setting.
         */
        update: (key: string, value: string): Promise<boolean> => {
            return this.storage.settings.update({ key, value })
                .then(() => (value !== 'true'));
        }
    };
}