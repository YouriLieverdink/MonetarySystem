import { v1 as uuidv1 } from 'uuid';
import { containsHash } from '../helpers';
import { Crypto, Gossip, GossipConfig } from '../services';
import { Address, Event, Transaction } from '../types';

export class Internal extends Gossip<Event<Transaction>> {
    /**
     * Used for cryptography.
     */
    private crypto: Crypto;

    /**
     * The address used for signing the events.
     */
    private address: Address;

    /**
     * Class constructor.
     * 
     * @param config The configuration for gossip.
     */
    constructor(config: GossipConfig) {
        super(config);

        this.crypto = new Crypto();
        this.address = this.crypto.createAddress();

        // Create the initial event.
        const event: Event<Transaction> = {
            id: uuidv1(),
            timestamp: new Date(),
            publicKey: this.address.publicKey,
            signature: ''
        };

        // Sign the message.
        event.signature = this.crypto.createSignature(
            event,
            this.address.privateKey
        );

        this.items.push(event);
        this.lastItem = event;
    }

    /**
     * Called every constant `interval`.
     */
    protected onTick(): void {
        //
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

        // Create an item to commemorate the sync.
        const event: Event<Transaction> = {
            id: uuidv1(),
            timestamp: new Date(),
            selfParent: this.crypto.createHash(this.lastItem),
            otherParent: this.crypto.createHash(lastItem),
            publicKey: this.address.publicKey,
            signature: ''
        };

        // Sign the message.
        event.signature = this.crypto.createSignature(
            event,
            this.address.privateKey
        );

        this.items.push(event);
        this.lastItem = event;
    }
}