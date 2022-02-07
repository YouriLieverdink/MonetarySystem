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
        super(computers, 'blab', interval, me, server, crypto);

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

        const items = this.items.all();

        if (items.length > 50) {
            console.log(items);
            process.exit(0);
        }

        // const items = this.consensus.do(this.items.all());

        // const s = items.filter((item) => item.consensus);

        // for (let i = 0; i < s.length; i++) {
        //     //{{}}
        //     const item = s[i];

        //     const value = _.omit(item, this.except) as Event<Transaction[]>;
        //     this.items.remove(value);
        // }

        // console.log(`Current: ${this.items.all().length}`);
        // console.log(`Total: ${this.total += s.length}`);
        // console.log()

        // const items = this.consensus.do(this.items.all());

        // // We process the events on which consensus has been reached.
        // const cItems = items.filter((item) => item.consensus);
        // this.digester.do(cItems);

        // // We no longer these events.
        // for (let i = 0; i < cItems.length; i++) {
        //     //
        //     const cItem = cItems[i];

        //     const value = _.omit(cItem, this.except) as Event<Transaction[]>;
        //     this.items.remove(value);
        // }

        // console.log(`Current: ${items.length}`);
        // console.log(`Total: ${this.total += cItems.length}`);
        // console.log();
    }

    private total = 0;

    public onItems(items: Event<Transaction[]>[], publicKey: string): void {
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
        console.error(`${kind}, ${computer.ip}, ${error.message}`);
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
            // We sign each transaction individually as well.
            let { privateKey } = addresses.find((address) => address.publicKey === transaction.sender);
            if (!privateKey) privateKey = this.keys.privateKey;

            // Sign the transaction.
            transaction.signature = this.crypto.createSignature(transaction, privateKey);

            return transaction;
        });

        this.items.add(this.helpers.increment(event));
    };
};
//     public onTick(): void {
//         //
//         console.log(this.items.all().length);

//         // const items = this.consensus.do(this.items.all());

//         // // We process the events on which consensus has been reached.
//         // const cItems = items.filter((item) => item.consensus);
//         // this.digester.do(cItems);

//         // // We no longer these events.
//         // for (let i = 0; i < cItems.length; i++) {
//         //     //
//         //     const cItem = cItems[i];

//         //     const value = _.omit(cItem, this.except) as Event<Transaction[]>;
//         //     this.items.remove(value);
//         // }
//     };

//     /**
//      * This method is called whenever the gossip service has received items that
//      * it did not already know.
//      * 
//      * @param items The newly received items.
//      * @param publicKey The public key of the creator.
//      */
//     public onItems(items: Event<Transaction[]>[], publicKey: string): void {
//         //
//         items.forEach((item) => {
//             // We only accept items with a valid signature.
//             if (!this.helpers.isValid(item)) return;

//             // We only accept items we don't already know.
//             if (!this.helpers.isUnknown(item)) return;

//             // We only accept items of which we have both parents.
//             if (!this.helpers.hasParents(item)) return;

//             this.items.add(...items);
//         });

//         // We create a new item to commemorate the sync.
//         this.helpers.addEvent(
//             this.crypto.createHash(this.helpers.last(this.keys.publicKey)),
//             this.crypto.createHash(this.helpers.last(publicKey)),
//         );
//     }

//     /**
//      * This method is called whenever the axios post request to another computer
//      * throws an error.
//      * 
//      * @param kind The kind of error that was thrown.
//      * @param computer The computer to which the gossip service was communicating.
//      * @param error The actual error object.
//      */
//     public onError(kind: string, computer: Computer, error?: Error): void {
//         //
//         console.log(kind, computer.ip, error.message);
//     }

//     /**
//      * The helper methods.
//      */
//     private readonly helpers = {
//         /**
//          * Returns true when the signature is valid and whether the provided
//          * public key is the same as the `from` field in the transaction.
//          * 
//          * @param item The current item.
//          */
//         isValid: (item: Event<Transaction[]>): boolean => {
//             //
//             return this.crypto.verifySignature(
//                 item,
//                 item.signature,
//                 item.publicKey,
//                 ['signature'],
//             );
//         },
//         /**
//          * Returns true when we already know this item.
//          * 
//          * @param item The current item.
//          */
//         isUnknown: (item: Event<Transaction[]>): boolean => {
//             //
//             return this.items.all().every((i) => i.id !== item.id);
//         },
//         /**
//          * Returns true when we already have both the parents of this item or
//          * when it is genesis item.
//          * 
//          * @param item The current item.
//          */
//         hasParents: (item: Event<Transaction[]>): boolean => {
//             //
//             if (item.selfParent && item.otherParent) {
//                 //
//                 const hasSelfParent = this.crypto.containsHash(
//                     this.items.all(), item.selfParent, this.except,
//                 );

//                 const hasOtherParent = this.crypto.containsHash(
//                     this.items.all(), item.otherParent, this.except,
//                 );

//                 if (!hasSelfParent || !hasOtherParent) {
//                     // We don't have both parents.
//                     return false;
//                 }
//             }

//             return true;
//         },
//         /**
//          * Returns the item with the highest sequence number in the chain of the
//          * provided public key.
//          * 
//          * @param publicKey The public key of the chain.
//          */
//         last: (publicKey: string): Event<Transaction[]> => {
//             //
//             const items = this.items.all();

//             return items
//                 .filter((item) => item.publicKey === publicKey)
//                 .reduce((p, c) => {
//                     //
//                     if (!p) return c;

//                     if (p.sequence > c.sequence) {
//                         return p;
//                     }

//                     return c;
//                 }, null);
//         },
//         /**
//          * Adds an event to the instance.
//          * 
//          * @param selfParent Hash of this computer's last created event.
//          * @param otherParent Hash of the other computer's last created event.
//          */
//         addEvent: async (selfParent?: string, otherParent?: string): Promise<void> => {
//             //
//             const addresses = await this.storage.addresses.index();

//             const event: Event<Transaction[]> = {
//                 id: uuidv1(),
//                 createdAt: Date.now(),
//             };

//             // Add the selfParent and otherParent when provided.
//             if (selfParent && otherParent) {
//                 event.selfParent = selfParent;
//                 event.otherParent = otherParent;
//             }

//             // Add a transaction when available.
//             const transactions = this.pending.all();
//             this.pending.remove(...transactions);

//             event.data = transactions.map((transaction) => {
//                 // We sign each transaction individually as well.
//                 let { privateKey } = addresses.find((address) => address.publicKey === transaction.sender);
//                 if (!privateKey) privateKey = this.keys.privateKey;

//                 // Sign the transaction.
//                 transaction.signature = this.crypto.createSignature(transaction, privateKey);

//                 return transaction;
//             });

//             this.add(event);
//         },
//     };
// }