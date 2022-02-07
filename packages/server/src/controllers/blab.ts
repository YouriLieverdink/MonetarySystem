import { Express } from 'express';
import { v1 as uuidv1 } from 'uuid';
import { Collection, Consensus, Crypto, Digester, Gossip, Item, Storage } from '../services/_';
import { Computer, Event, Transaction } from '../types/_';

export class Blab extends Gossip<Event<Transaction[]>> {
    /**
     * Performs the consensus algorithm.
     */
    private consensus: Consensus<Transaction[]>;

    /**
     * Processes the events on which consensus has been reached.
     */
    private digester: Digester;

    /**
     * Class construtor.
     * 
     * @param computers The known computers in the network.
     * @param endpoint The endpoint this class should use.
     * @param interval The interval at which this computer should gossip.
     * @param me This computer.
     * @param server The active express server.
     * @param pending Transactions which have to be distributed.
     * @param crypto Used for cryptographic operations.
     * @param storage The interface for the database.
     */
    constructor(
        protected computers: Collection<Computer>,
        interval: number,
        me: Computer,
        server: Express,
        private pending: Collection<Transaction>,
        protected crypto: Crypto,
        private storage: Storage,
    ) {
        //
        super(computers, 'blab', interval, me, server, crypto, 'id');

        this.consensus = new Consensus();
        this.digester = new Digester(storage, crypto);

        this.createEvent();
    }

    protected get except(): string[] {
        //
        return ['round', 'witness', 'vote', 'famous', 'roundReceived', 'timestamp', 'consensus', 'index'];
    }

    public onTick(): void {
        //
        const items = this.consensus.do(this.items.all());
        this.items.remove(...items);

        this.digester.do(items);

        console.log(`Current: ${this.items.all().length}`);
        console.log(`Consensus: ${this.total += items.length}`);
        console.log();
    }

    private total = 0;

    public onItems(items: Item<Event<Transaction[]>>[], publicKey: string): void {
        //
        for (let i = 0; i < items.length; i++) {
            //
            const item = items[i];

            if (item.selfParent && item.otherParent) {
                //
                const hasSelfParent = this.crypto.containsHash(
                    this.items.all(), item.selfParent, this.except,
                );

                const hasOtherParent = this.crypto.containsHash(
                    this.items.all(), item.otherParent, this.except,
                );

                if (!hasSelfParent || !hasOtherParent) {
                    // We don't have both parents.
                    continue;
                }
            }

            this.items.add(item);
        }

        // We create an event to commemorate the sync.
        const self = this.helpers.last(this.keys.publicKey);
        const other = this.helpers.last(publicKey);

        this.createEvent(
            this.crypto.createHash(self, this.except),
            this.crypto.createHash(other, this.except),
        );
    }

    public onError(kind: string, computer: Computer, error?: Error): void {
        //
        console.error(`${kind} - ${error.message}`);
    }

    /**
     * Creates a new event.
     * 
     * @param selfParent The hash of this computer's latest event.
     * @param otherParent The hash of the latest event the other computer has created.
     */
    public async createEvent(selfParent?: string, otherParent?: string): Promise<void> {
        //
        const addresses = await this.storage.addresses.index();

        const event: Event<Transaction[]> = {
            id: uuidv1(),
            createdAt: Date.now(),
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
            // We sign each transaction individually.
            let { privateKey } = addresses.find((address) => address.publicKey === transaction.sender);
            if (!privateKey) privateKey = this.keys.privateKey;

            // Sign the transaction.
            transaction.signature = this.crypto.createSignature(transaction, privateKey);

            return transaction;
        });

        this.items.add(this.helpers.increment(event));
    };
};