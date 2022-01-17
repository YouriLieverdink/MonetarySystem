import Container from 'typedi';
import { v1 as uuidv1 } from 'uuid';
import { containsHash } from '../helpers';
import { Consensus, Crypto, Gossip, GossipConfig, Queue, Storage } from '../services';
import { Event, Transaction } from '../types';

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
     *
     * Used for permanent storage on disk.
     */
    private storage: Storage;

    /**
     * Class constructor.
     * 
     * @param config The configuration for gossip.
     */
    constructor(config: GossipConfig) {
        super(config);

        // Inject depedencies.
        this.crypto = Container.get<Crypto>('crypto');
        this.queue = Container.get<Queue<Transaction>>('transactions');
        this.storage = Container.get<Storage>('storage');
        this.consensus = new Consensus();

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
        if (addresses.length === 0) return;

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
        // Initiate a new consensus calcuation.
        const events = this.consensus.doConsensus(this.items);

        // Check if mirror is enabled.
        const mirror = await this.storage.settings.get('mirror');

        const promises: Promise<void>[] = [];

        // We have reached consensus on these events.
        events.forEach((event) => {
            // We remove after 5 seconds to ensure everyone has it.
            setTimeout(() => {
                const index = this.items.indexOf(event);
                if (index > -1) {
                    this.items.splice(index, 1);
                }
            }, 5000);

            if (mirror && mirror.value === 'true') {
                promises.push(this.storage.events.create(event));
            }
        });
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