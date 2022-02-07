import axios, { AxiosError } from 'axios';
import { Express } from 'express';
import _ from 'lodash';
import { Computer, Keys } from '../types/_';
import { Crypto } from './crypto';
import { Collection } from './_';

export type Item<T> = T & {
    sequence?: number;
    publicKey?: string;
};

export type Data<T> = {
    values: { [separator: string]: number },
    items: Item<T>[],
    publicKey?: string;
    signature?: string;
};

export abstract class Gossip<T> {
    /**
     * The items to distribute via gossip.
     */
    protected items: Collection<Item<T>>;

    /**
     * The keys for signing transactions.
     */
    protected keys: Keys;

    /**
     * Class construtor.
     * 
     * @param computers The known computers in the network.
     * @param endpoint The endpoint this class should use.
     * @param interval The interval at which this computer should gossip.
     * @param me This computer.
     * @param server The active express server.
     * @param crypto Used for cryptographic operations.
     */
    constructor(
        protected computers: Collection<Computer>,
        private endpoint: string,
        interval: number,
        private me: Computer,
        server: Express,
        protected crypto: Crypto,
    ) {
        //
        this.items = new Collection();
        this.keys = this.crypto.createKeys();

        // Initialise the listener.
        server.post(`/${this.endpoint}`, async ({ body }, res) => {
            //
            if (!this.helpers.verify(body)) {
                // Ignore because the signature is invalid.
                return res.status(400);
            }

            let data = await this.handleHandshake(body);
            data = this.helpers.sign(data);

            res.status(200).json(data);
        });

        // Initialise the sender.
        setInterval(this.tick.bind(this), interval);
    }

    /**
     * Called every `interval` to start with the initiating of a new gossip sync
     * with a computer in the network.
     */
    private async tick(): Promise<void> {
        //
        this.onTick();

        const computer = this.computers.random(this.me);
        if (!computer || computer.ip === this.me.ip) return;

        await this.doHandshake(computer);
    };

    /**
     * Initiates a new handshake with the provided computer. This is a
     * three-way handshake in which both computers tell eachother what the
     * other one does not know yet.
     * 
     * @param computer The computer to handshake with.
     */
    private async doHandshake(computer: Computer): Promise<void> {
        //
        try {
            // We collect everything we know.
            let data = this.helpers.data();
            data = this.helpers.sign(data);

            const response = await axios.post(
                `http://${computer.ip}:${computer.port}/${this.endpoint}`,
                data,
            );

            if (!this.helpers.verify(response.data)) {
                // Ignore because the signature is invalid.
                return;
            }

            data = await this.handleHandshake(response.data);
            data = this.helpers.sign(data);

            await axios.post(
                `http://${computer.ip}:${computer.port}/${this.endpoint}`,
                data,
            );
        } //
        catch (e) {
            const error: AxiosError = e;

            if (error.response) {
                // The other computer returned a response outside 2xx.
                this.onError('error-response', computer, e);
            } //
            else if (error.request) {
                // The other computer did not respond.
                this.onError('error-request', computer, e);
            } //
            else {
                // An unknown error has occured.
                this.onError('error-unknown', computer, e);
            }
        }
    };

    /**
     * This is the receiving end of the handshake. This computer adds any items
     * provided and calculates which items need to be send back.
     * 
     * @param data The received data.
     */
    private async handleHandshake(data: Data<T>): Promise<Data<T>> {
        //
        if (data.items.length > 0) {
            //
            let items = data.items.map((item) => _.omit(item, this.except) as Item<T>);

            items = _.differenceWith(
                data.items,
                this.items.all(),
                // We use full equality when no `unique` key was provided.
                this.unique ? (a, b) => a[this.unique] === b[this.unique] : _.isEqual,
            );

            this.onItems(items, data.publicKey);
        }

        // The response which needs to be send.
        const response: Data<T> = { values: {}, items: [] };

        const values = Object.entries(data.values);

        for (let i = 0; i < values.length; i++) {
            //
            const [key, sequence] = values[i];
            const data = this.helpers.data();

            if (!(key in data.values)) {
                // We want to request this item because we don't have it yet.
                response.values[key] = 0;
                continue;
            }

            if (data.values[key] > sequence) {
                // We have a higher sequence number, add the missing items.
                const items = this.items.all().filter((item) => {
                    return item.sequence > sequence && item.sequence <= data.values[key];
                });

                response.items.push(...items);
            } //
            else {
                // The other computer knows more, request the remaining items.
                response.values[key] = data.values[key];
            }
        }

        return response;
    };

    /**
     * Helper methods for repetetive tasks.
     */
    protected readonly helpers = {
        /**
         * Constructs a data object which contains the higest sequence numbers
         * for every unique chain.
         */
        data: (): Data<T> => {
            //
            const data: Data<T> = { values: {}, items: [] };
            const items = this.items.all();

            for (let i = 0; i < items.length; i++) {
                //
                const item = items[i];
                const s = data.values[item[this.chain]];

                // We set the value when null or higher.
                if (!s || item.sequence > s) {
                    data.values[item[this.chain]] = item.sequence;
                }
            }

            return data;
        },
        /**
         * This method sets the sequence number of the provided item to the
         * current max + 1 and returns it.
         * 
         * @param item The item to increment
         */
        increment: (item: Item<T>): Item<T> => {
            //
            item.publicKey = this.keys.publicKey;

            const data = this.helpers.data();
            const s = data.values[item[this.chain]];

            item.sequence = (s || 0) + 1;

            return item;
        },
        /**
         * Returns the last item in the chain with value `key`.
         * 
         * @param key The key of the chain to search. 
         */
        last: (key: string): Item<T> => {
            //
            const items = this.items.all();

            return items
                .filter((item) => item[this.chain] === key)
                .reduce((previous, current) => {
                    // This happens when the filtered items has length 1.
                    if (!previous) return current;

                    if (previous.sequence > current.sequence) {
                        return previous;
                    }

                    return current;

                }, null);
        },
        /**
         * Adds a signature to the provided data.
         * 
         * @param data The data to sign.
         */
        sign: (data: Data<T>): Data<T> => {
            //
            data.publicKey = this.keys.publicKey;

            data.signature = this.crypto.createSignature(
                data,
                this.keys.privateKey,
                ['signature'],
            );

            return data;
        },
        /**
         * Returns true when the signature is valid.
         * 
         * @param data The data to verify.
         */
        verify: (data: Data<T>): boolean => {
            //
            if (!data.signature) return false;

            return this.crypto.verifySignature(
                data,
                data.signature,
                data.publicKey,
                ['signature'],
            );
        },
    };

    /**
     * This service uses sequence numbers to perform the protocol. This value,
     * `chain`, indicates which value in the items should be used to chain.
     */
    protected get chain(): string {
        //
        return 'publicKey';
    }

    /**
     * Some information should not be send to other computers and this method
     * indicates what shouldn't be send. Returns an array of strings with keys
     * which should be excluded from any requests.
     */
    protected get except(): string[] {
        //
        return [];
    }

    /**
     * This method returns the name of the field which the service uses to 
     * determine whether two objects are equal. The default is `id`. It is also
     * possible to return `null` to use full object equality.
     */
    protected get unique(): string | null {
        //
        return 'id';
    };

    /**
     * This method is called everytime the gossip service initiates a new
     * handshake with a randomly selected computer.
     */
    protected abstract onTick(): void;

    /**
     * This method is called whenever the gossip service has received items that
     * it did not already know.
     * 
     * @param items The newly received items.
     * @param publicKey The public key of the other computer.
     */
    protected abstract onItems(items: T[], publicKey: string): void;

    /**
     * This method is called whenever the axios post request to another computer
     * throws an error.
     * 
     * @param kind The kind of error that was thrown.
     * @param computer The computer to which the gossip service was communicating.
     * @param error The actual error object.
     */
    protected abstract onError(kind: string, computer: Computer, error?: Error): void;
};