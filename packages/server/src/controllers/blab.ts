import { Express } from 'express';
import { v1 as uuidv1 } from 'uuid';
import { Collection, Consensus, Crypto, Digester, Gossip, Storage } from '../services/_';
import { Computer, Event, Transaction } from '../types/_';

export class Blab extends Gossip<Event<Transaction>> {
    /**
     * Performs the consensus algorithm.
     */
    private consensus: Consensus<Transaction>;

    /**
     * Used for cryptographic operations.
     */
    private crypto: Crypto;

    /**
     * Processes events when consensus has been reached.
     */
    private digester: Digester<Transaction>;

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
        this.digester = new Digester();

        // Add the initial event to start gossip.
        this.helpers.addEvent();
    }

    /**
     * This array contains all the keys the class does not wish to be send over
     * the network or to be used in equality comparisons.
     */
    public except(): string[] {
        return ['consensus', 'round', 'witness', 'roundReceived', 'famous', 'timestamp', 'index'];
    };

    /**
     * This method is called everytime the gossip service initiates a new
     * handshake with a randomly selected computer.
     */
    public onTick(): void {
        //
        const items = this.consensus.doConsensus(
            this.items.all(),
            // TODO: Think of a way to calculate `n` consistantly.
            4,
        );

        const cEvents = items.filter((item) => item.consensus);

        // We process the items. 
        this.digester.digest(cEvents);

        // TODO: Remove the items after consensus has been reached.
    };

    /**
     * This method is called whenever the gossip service has received items that
     * it did not already know.
     * 
     * @param items The newly received items.
     * @param last The last item the other computer has created.
     */
    public onItems(items: Event<Transaction>[], last: Event<Transaction>): void {
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
        isValid: (item: Event<Transaction>): boolean => {
            //
            item = { ...item };
            const signature = item.signature;
            item.signature = '';

            if (!this.crypto.verifySignature(item, signature, item.publicKey)) {
                // The message has possibly been modified.
                return false;
            }

            if (item.data && item.publicKey !== item.data.from) {
                // The used who signed the transaction didn't send the money.
                return false;
            }

            return true;
        },
        /**
         * Returns true when we already know this item.
         * 
         * @param item The current item.
         */
        isUnknown: (item: Event<Transaction>): boolean => {
            //
            return this.items.all().every((i) => i.id !== item.id);
        },
        /**
         * Returns true when we already have both the parents of this item or
         * when it is genesis item.
         * 
         * @param item The current item.
         */
        hasParents: (item: Event<Transaction>): boolean => {
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
            // We need at least one address to send events.
            const addresses = await this.storage.addresses.index();
            if (addresses.length === 0) return;

            const event: Event<Transaction> = {
                id: uuidv1(),
                createdAt: Date.now(),
                publicKey: addresses[0].publicKey,
                signature: '',
            };

            // Add the selfParent and otherParent when provided.
            if (selfParent && otherParent) {
                event.selfParent = selfParent;
                event.otherParent = otherParent;
            }

            // Add a transaction when available.
            const transaction = this.pending.shift();
            if (transaction) event.data = transaction;

            // Sign the message to ensure validity.
            event.signature = this.crypto.createSignature(event, addresses[0].privateKey);

            this.items.add(event);
            this.last = event;
        },
    };
}