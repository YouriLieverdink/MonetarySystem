import { Express } from 'express';
import _ from 'lodash';
import { v1 as uuidv1 } from 'uuid';
import { Collection, Consensus, Crypto, Digester, Gossip, Storage } from '../services/_';
import { Address, Computer, Event, Transaction } from '../types/_';

export class Blab extends Gossip<Event<Transaction[]>> {
    /**
     * Performs the consensus algorithm.
     */
    private consensus: Consensus<Transaction[]>;

    /**
     * Used for cryptographic operations.
     */
    private crypto: Crypto;

    /**
     * Processes events when consensus has been reached.
     */
    private digester: Digester;

    /**
     * The keys used to sign events.
     */
    private keys: Address;

    /**
     * A list of known id's so we don't accept them anymore.
     */
    private known: string[];

    /**
     * Class construtor.
     * 
     * @param computers The known computers in the network.
     * @param interval The interval at which this computer should gossip.
     * @param me This computer.
     * @param pending A collection with the pending transaction.
     * @param server The active express server.
     * @param storage The interface for the database.
     */
    constructor(
        protected computers: Collection<Computer>,
        interval: number,
        me: Computer,
        private pending: Collection<Transaction>,
        server: Express,
        private storage: Storage,
    ) {
        //
        super(computers, 'blab', interval, me, server);

        this.consensus = new Consensus();
        this.crypto = new Crypto();
        this.digester = new Digester(this.crypto, this.storage);
        this.keys = this.crypto.createKeys();
        this.known = [];

        // Add the initial event to start gossip.
        this.helpers.addEvent();
    }

    /**
     * This array contains all the keys the class does not wish to be send over
     * the network or to be used in equality comparisons.
     */
    public except(): string[] {
        return ['round', 'witness', 'vote', 'famous', 'roundReceived', 'timestamp', 'consensus', 'index'];
    };

    /**
     * This method is called everytime the gossip service initiates a new
     * handshake with a randomly selected computer.
     */
    public onTick(): void {
        //
        const items = this.consensus.do(this.items.all());

        // The items which have the `consensus` flag can be processed.
        const cItems = items.filter((item) => item.consensus);

        for (const cItem of cItems) {
            //
            this.known.push(cItem.id);
            this.items.remove(_.omit(cItem as Object, this.except()) as Event<Transaction[]>);
        }

        // Process the events on which consensus has been reached.
        this.digester.do(cItems);
    };

    /**
     * This method is called whenever the gossip service has received items that
     * it did not already know.
     * 
     * @param items The newly received items.
     * @param last The last item the other computer has created.
     */
    public onItems(items: Event<Transaction[]>[], last: Event<Transaction[]>): void {
        //
        items.forEach((item) => {
            // We only accept items with a valid signature.
            if (!this.helpers.isValid(item)) return;

            // We only accept items we don't already know.
            if (!this.helpers.isUnknown(item)) return;

            // We only accept items of which we have both parents.
            if (!this.helpers.hasParents(item)) return;

            this.items.add(item);
        });

        // We create a new item to commemorate the sync.
        this.helpers.addEvent(
            this.crypto.createHash(this.last, this.except()),
            this.crypto.createHash(last, this.except()),
        );
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
    private readonly helpers = {
        /**
         * Returns true when the signature is valid and whether the provided
         * public key is the same as the `from` field in the transaction.
         * 
         * @param item The current item.
         */
        isValid: (item: Event<Transaction[]>): boolean => {
            //
            item = { ...item };
            const signature = item.signature;
            item.signature = '';

            return this.crypto.verifySignature(item, signature, item.publicKey);
        },
        /**
         * Returns true when we already know this item.
         * 
         * @param item The current item.
         */
        isUnknown: (item: Event<Transaction[]>): boolean => {
            //
            return (
                this.items.all().every((i) => i.id !== item.id) &&
                !this.known.includes(item.id)
            );
        },
        /**
         * Returns true when we already have both the parents of this item or
         * when it is genesis item.
         * 
         * @param item The current item.
         */
        hasParents: (item: Event<Transaction[]>): boolean => {
            //
            if (item.selfParent && item.otherParent) {
                //
                const hasSelfParent = this.crypto.containsHash(
                    this.items.all(), item.selfParent, this.except(),
                );

                const hasOtherParent = this.crypto.containsHash(
                    this.items.all(), item.otherParent, this.except(),
                );

                if (!hasSelfParent || !hasOtherParent) {
                    // We don't have both parents.
                    return false;
                }
            }

            return true;
        },
        /**
         * Adds an event to the instance.
         * 
         * @param selfParent Hash of this computer's last created event.
         * @param otherParent Hash of the other computer's last created event.
         */
        addEvent: async (selfParent?: string, otherParent?: string): Promise<void> => {
            //
            const addresses = await this.storage.addresses.index();

            const event: Event<Transaction[]> = {
                id: uuidv1(),
                createdAt: Date.now(),
                publicKey: this.keys.publicKey,
                signature: '',
            };

            // Add the selfParent and otherParent when provided.
            if (selfParent && otherParent) {
                event.selfParent = selfParent;
                event.otherParent = otherParent;
            }

            // Add a transaction when available.
            const transactions = this.pending.all();
            this.pending.remove(...transactions);

            event.data = transactions.map((transaction) => {
                // We sign each transaction individually as well.
                let { privateKey } = addresses.find((address) => address.publicKey === transaction.sender);
                if (!privateKey) privateKey = this.keys.privateKey;

                // Sign the transaction.
                transaction.signature = this.crypto.createSignature(transaction, privateKey);

                return transaction;
            });

            // Sign the message to ensure validity.
            event.signature = this.crypto.createSignature(event, this.keys.privateKey);

            this.items.add(event);
            this.last = event;
        },
    };
}