import { Express } from 'express';
import _ from 'lodash';
import { v1 as uuidv1 } from 'uuid';
import { cEvent, Collection, Consensus, Crypto, Gossip, Storage } from '../services/_';
import { Computer, Event, Transaction } from '../types/_';

export class Blab {
    /**
     * The gossip instance.
     */
    private instance: Gossip<Event<Transaction>>;

    /**
     * Performs the consensus algorithm.
     */
    private consensus: Consensus<Transaction>;

    /**
     * Used for cryptographic operations.
     */
    private crypto: Crypto

    /**
     * Class constructor.
     * 
     * @param server The active express server.
     * @param computers The known computers in the network.
     * @param interval The interval at which to operate.
     * @param pending The pending transaction from this computer's user.
     * @param storage The interface for the database.
     * @param me This computer.
     */
    constructor(
        private server: Express,
        private computers: Collection<Computer>,
        private interval: number,
        private pending: Collection<Transaction>,
        private storage: Storage,
        private me: Computer,
    ) {
        //
        this.consensus = new Consensus();
        this.crypto = new Crypto();

        this.instance = new Gossip(
            this.server, 'blab', this.interval, this.computers, this.me
        );

        // Add the initial event to start blabber.
        this.addEvent();

        this.instance.onTick.subscribe(this.onTick.bind(this));
        this.instance.onItems.subscribe(this.onItems.bind(this));
        this.instance.onError.subscribe(this.onError.bind(this));
    }

    /**
     * Handles the `onTick` event.
     */
    private async onTick(): Promise<void> {
        // We use the latest events from gossip.
        let events: cEvent<Transaction>[] = this.instance.items.getItems();

        events = this.consensus.doConsensus(
            events,
            // TODO: Find a way to calculate n.
            this.computers.items.length,
        );
    }

    /**
     * Handles the `onItems` event.
     * 
     * @param args The event arguments.
     */
    private async onItems(args: { items: Event<Transaction>[], lastItem: Event<Transaction> }): Promise<void> {
        //
        args.items.forEach((item) => {
            // We only accept items with a valid signature.
            const signature = item.signature;
            item.signature = '';

            const isValid = this.crypto.verifySignature(item, signature, item.publicKey);
            if (!isValid) return;

            // We re-add the signature so the event can be distributed again.
            item.signature = signature;

            // We only accept items we don't know yet.
            const isKnown = this.instance.items.getItems().some((i) => _.isEqual(i, item));
            if (isKnown) return;

            // We only accept items if they are genesis or we have both parents.
            if (item.selfParent && item.otherParent) {
                //
                const hasSelf = this.crypto.containsHash(
                    this.instance.items.getItems(),
                    item.selfParent,
                );

                const hasOther = this.crypto.containsHash(
                    this.instance.items.getItems(),
                    item.otherParent,
                );

                if (!(hasSelf && hasOther)) return;
            }

            this.instance.items.add(item);
        });

        // Create an event to commemorate the sync.
        this.addEvent(
            this.crypto.createHash(this.instance.items.getLastItem(), ['consensus', 'round', 'witness', 'roundReceived', 'famous', 'timestamp', 'index']),
            this.crypto.createHash(args.lastItem, ['consensus', 'round', 'witness', 'roundReceived', 'famous', 'timestamp', 'index']),
        );
    }

    /**
     * Handles the `onError` event.
     * 
     * @param args The event arguments.
     */
    private async onError(args: { kind: string, computer: Computer }): Promise<void> {
        //
    }

    /**
     * Adds an event to the instance.
     * 
     * @param selfParent Hash of this computer's last created event.
     * @param otherParent Hash of the other computer's last created event.
     */
    private async addEvent(selfParent?: string, otherParent?: string): Promise<void> {
        // We need at least one address to send events.
        const addresses = await this.storage.addresses.index();
        if (addresses.length === 0) return;

        const event: Event<Transaction> = {
            id: uuidv1(),
            createdAt: Date.now(),
            publicKey: addresses[0].publicKey,
            signature: '',
            selfParent: selfParent,
            otherParent: otherParent,
        };

        // Add a transaction when available.
        const transaction = this.pending.shift();
        if (transaction) event.data = transaction;

        // Sign the message to ensure validity.
        event.signature = this.crypto.createSignature(event, addresses[0].privateKey);

        this.instance.items.add(event);
        this.instance.items.addLast(event);
    }
}