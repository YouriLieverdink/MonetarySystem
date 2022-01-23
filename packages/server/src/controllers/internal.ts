import { Express } from 'express';
import { v1 as uuidv1 } from 'uuid';
import { containsHash } from '../helpers';
import { Collection, Consensus, Crypto, Gossip, Storage } from '../services/*';
import { Computer, Event, Transaction } from '../types/*';

export class Internal extends Gossip<Event<Transaction>> {
    /**
     * Performs the consensus algorithm.
     */
    private consensus: Consensus<Transaction>;

    /**
     * Used for cryptographic operations.
     */
    private crypto: Crypto;

    /**
     * Class constructor.
     * 
     * @param computers The available computers to communicate with.
     * @param server The active express server.
     * @param pending The collection for pending transactions.
     * @param storage The interface for the database.
     */
    constructor(
        computers: Collection<Computer>,
        server: Express,
        private pending: Collection<Transaction>,
        private storage: Storage,
    ) {
        super(server, computers);

        this.consensus = new Consensus();
        this.crypto = new Crypto();

        // Set the initial event.
        this.addEvent();
    }

    /**
     * Adds a new event to be distributed.
     * 
     * @param selfParent The last event this computer has created.
     * @param otherParent The last event the other computer has created.
     */
    protected async addEvent(
        selfParent?: string,
        otherParent?: string
    ): Promise<void> {
        //
        const addresses = await this.storage.addresses.index();

        // We must have an address before we can sign transactions.
        if (addresses.length === 0) {
            const { publicKey, privateKey } = this.crypto.createAddress();
            await this.storage.addresses.create(publicKey, privateKey, 1);
            return;
        }

        const address = addresses[0];

        const event: Event<Transaction> = {
            id: uuidv1(),
            timestamp: new Date(),
            publicKey: address.publicKey,
            signature: '',
            selfParent: selfParent,
            otherParent: otherParent
        };

        // Add a single transactions (when available) to the event.
        const transaction = this.pending.shift();
        if (transaction !== null) {
            event.data = transaction;
        }

        // Signs the message.
        event.signature = this.crypto.createSignature(event, address.privateKey);

        this.items.push(event);
        this.lastItem = event;
    }

    /**
     * Called every constant `interval`.
     */
    protected async onTick(): Promise<void> {
        //
        console.log(this.items.length);
    }

    /**
     * Called whenever this computer received a batch of items.
     * 
     * @param items The newly received items.
     * @param lastItem The last item the other computer created.
     */
    protected onItems(
        items: Event<Transaction>[],
        lastItem: Event<Transaction>
    ): void {
        //
        items.forEach((item) => {
            // We only accept events with valid signatures.
            const signature = item.signature;
            item.signature = '';

            if (!this.crypto.verifySignature(item, signature, item.publicKey)) {
                // The signature is invalid.
                return;
            }

            item.signature = signature;

            if (!this.items.find((i) => i.id === item.id)) {
                // We don't know this event.
                if (!item.selfParent && !item.otherParent) {
                    // Accept because it is a genenis event.
                    return this.items.push(item);
                }

                const hasSelf = containsHash(this.items, item.selfParent);
                const hasOther = containsHash(this.items, item.otherParent);

                if (hasSelf && hasOther) {
                    // Accept because we know both parents.
                    return this.items.push(item);
                }
            }
        });

        // Create an event to commemorate the sync.
        const selfParent = this.crypto.createHash(this.lastItem);
        const otherParent = this.crypto.createHash(lastItem);

        this.addEvent(selfParent, otherParent);
    }
}