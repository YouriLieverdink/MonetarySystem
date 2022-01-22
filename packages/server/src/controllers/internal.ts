import { Express } from 'express';
import { v1 as uuidv1 } from 'uuid';
import { containsHash } from '../helpers';
import { Collection } from '../services/collection';
import { Consensus } from '../services/consensus';
import { Crypto } from '../services/crypto';
import { Gossip } from '../services/gossip';
import { Queue } from '../services/queue';
import { Storage } from '../services/storage';
import { Computer } from '../types/computer';
import { Event } from '../types/event';
import { Transaction } from '../types/transaction';

export class Internal extends Gossip<Event<Transaction>> {
    /**
    * The algorithm for reaching consensus.
    */
    private consensus: Consensus<Transaction>;

    /**
     * Used for cryptography.
     */
    private crypto: Crypto;

    /**
     * Transactions created by the user for distribution.
     */
    private queue: Queue<Transaction>;

    /** 
     * Used to store things in the database.
     */
    private storage: Storage;

    /**
     * Class constructor.
     * 
     * @param computers The known computers.
     * @param queue The queue with transactions.
     * @param storage The storage service.
     * @param server The express server.
     */
    constructor(
        computers: Collection<Computer>,
        queue: Queue<Transaction>,
        storage: Storage,
        server: Express,
    ) {
        super(server, computers);

        this.consensus = new Consensus();
        this.crypto = new Crypto();
        this.queue = queue;
        this.storage = storage;

        // Set the initial event.
        this.addEvent();
    }

    /**
     * Adds a new event to this items.
     * 
     * @param selfParent The parent of the event created by this computer.
     * @param otherParent The parent of the event created by another.
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
        const transactions = this.queue.pop();
        if (transactions.length > 0) {
            event.data = transactions[0];
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