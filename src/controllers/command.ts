import { Express } from 'express';
import readline from 'readline';
import Container from 'typedi';
import { Api, Cli, Crypto, Queue, Storage } from '../services';
import { Address, Setting, State, Transaction } from '../types';

export class Command {
    /** 
     * Used to access cryptographic functions.
     */
    private crypto: Crypto;

    /** 
     * Transactions created by the user for distribution.
     */
    private queue: Queue<Transaction>;

    /** 
     * Used to store events which contain a consensus timestamp. 
     */
    private storage: Storage;

    /** 
     * Class constructor. 
     * 
     * @param crypto The crypto service.
     */
    constructor(
        crypto?: Crypto,
    ) {
        this.crypto = crypto || new Crypto();

        // Inject dependencies.
        this.queue = Container.get<Queue<Transaction>>('transactions');
        this.storage = Container.get<Storage>('storage');

        this.initApi();
        this.initCli();
    }

    /** 
     * Initialise the api handling.
     */
    private initApi(): void {
        const api = new Api(this);

        const express = Container.get<Express>('express');
        express.get('/api/*', api.handle);
    }

    /** 
     * Initialise the cli handling.
     */
    private initCli(): void {
        const cli = new Cli(this, console);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = () => rl.question(
            '\x1b[0mtritium> ',
            async (command) => {
                await cli.handle(command);
                ask();
            },
        );

        ask();
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

            await this.storage.addresses.create(
                address.publicKey,
                address.privateKey,
                0,
            );

            return address;
        },
        /**
         * Import an existing address.
         * 
         * @param privateKey The private key of the address.
         */
        import: async (privateKey: string): Promise<void> => {
            const publicKey = this.crypto.derivePublicKey(privateKey);

            return this.storage.addresses.create(publicKey, privateKey, 0);
        },
        /**
         * Remove an address from this computer.
         * 
         * @param publicKey The public key of the address.
         */
        remove: async (publicKey: string): Promise<void> => {
            return this.storage.addresses.destroy(publicKey);
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
        get: async (publicKey: string): Promise<Transaction[]> => {
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

            for (const { publicKey } of addresses)
                transactions.push(...(await this.transactions.get(publicKey)));

            return transactions;
        },
        /**
         * Create a new transaction.
         * 
         * @param from The public key of the sending address.
         * @param to The public key of the receiving address.
         * @param amount The amount to transfer.
         */
        create: (from: string, to: string, amount: number): void => {
            this.queue.push({ from, to, amount });
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
        get: async (key: string): Promise<Setting> => {
            return this.storage.settings.get(key);
        },
        /**
         * Updates the setting for a given key.
         * 
         * @param key The key of the setting.
         * @param value The value of the setting.
         */
        update: async (key: string, value: string): Promise<void> => {
            return this.storage.settings.update({ key, value });
        }
    };
}