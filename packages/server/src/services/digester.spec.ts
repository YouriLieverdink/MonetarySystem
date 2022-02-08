import { Database } from 'sqlite3';
import { Crypto, Digester, Storage } from '../services/_';
import { Address, Transaction } from '../types/_';
import { _Event } from "./consensus";

describe('Digester', () => {
    let database: Database;
    let crypto: Crypto;
    let storage: Storage;
    let digester: Digester;

    let keys: Address[];
    let transactions: Transaction[];
    let events: _Event<Transaction[]>[];

    beforeEach(() => {
        //
        crypto = new Crypto();
        database = new Database(':memory:');
        storage = new Storage(database);
        digester = new Digester(storage, crypto);

        events = [];

        keys = [
            {
                publicKey: 'MCowBQYDK2VwAyEA/f37XMyOpTo8h8AI13vW35XbFiLyGqUnvzZBf+E7c/U=',
                privateKey: 'MC4CAQAwBQYDK2VwBCIEIBNbAGPzVHNJD5czAGguPMJRkr1XxlHuCHlz95ZGB8lH'
            },
            {
                publicKey: 'MCowBQYDK2VwAyEAK4mtCxwA3PT2iL9L5Ujs3gMOSFmnnkLavXQXBLd2Ab4=',
                privateKey: 'MC4CAQAwBQYDK2VwBCIEIImicYld6nHMm8tNueeOHvLSY7gugJXGlNrDhMZ6dEb9'
            },
            {
                publicKey: 'MCowBQYDK2VwAyEAUR3ad1gK+NqjsIQyaKO3VY9Gzoxsy9bZ47izEm+/M4s=',
                privateKey: 'MC4CAQAwBQYDK2VwBCIEIBycVur+UPgR0Q8HIYXgz/VIP2dx1f9h++90z28Dloxx'
            },
            {
                publicKey: 'MCowBQYDK2VwAyEAnwbABLBcKTl947/i50/Wa00Baj7AM1M4DZqW0d7PUAY=',
                privateKey: 'MC4CAQAwBQYDK2VwBCIEIOF0nwXFKpV9R2kXlr5WDKWFhdKfYn2jqhdk+AhnAwP5'
            },
            {
                publicKey: 'MCowBQYDK2VwAyEAFcLEOYDiI2HKm72UGA5ByHYO085aMiDnhpHX6qPt+HM=',
                privateKey: 'MC4CAQAwBQYDK2VwBCIEIMo5E1Lk36LV2Fky58G8yM57iqkD80xeiiX3DwBzsEiU'
            },
            {
                publicKey: 'MCowBQYDK2VwAyEAxYxsER1vb5gyRUJlKNiVQNIY5qmCH8CTYwlqdhZx5B0=',
                privateKey: 'MC4CAQAwBQYDK2VwBCIEIDHn2l4tSXLRaBKpSVDeV5iOQ7m2V6ly/dx/NPKzgh+x'
            }
        ];

        transactions = [
            { id: '11', sender: keys[0].publicKey, receiver: keys[1].publicKey, amount: 98, signature: '' },
            { id: '22', sender: keys[1].publicKey, receiver: keys[2].publicKey, amount: 34, signature: '' },
            { id: '33', sender: keys[2].publicKey, receiver: keys[3].publicKey, amount: 59, signature: '' },
            { id: '44', sender: keys[3].publicKey, receiver: keys[4].publicKey, amount: 32, signature: '' },
            { id: '55', sender: keys[4].publicKey, receiver: keys[5].publicKey, amount: 18, signature: '' },
            { id: '66', sender: keys[5].publicKey, receiver: keys[0].publicKey, amount: 18, signature: '' },
        ];

        for (let i = 0; i < 6; i++) {
            //
            const transaction = transactions[i];

            // We use the private key to sign each individual transaction.
            transaction.signature = crypto.createSignature(
                transaction,
                keys[i].privateKey,
                ['signature'],
            );

            events.push({
                id: `${i}`,
                index: i,
                createdAt: 0,
                timestamp: 0,
                publicKey: keys[i].publicKey,
                data: [transaction],
            });
        }
    });

    describe('do', () => {

        it('executes a transaction when the sender has enough balance', async () => {
            //
            await storage.transactions.create({ id: '0', sender: '~', receiver: keys[0].publicKey, amount: 100, signature: '' });

            const spy = jest.spyOn(storage.transactions, 'create');
            const event = events[0];

            await digester.do([event]);

            expect(spy).toBeCalled();
        });

        it('ignores a transaction when the sender does not have enough balance', async () => {
            //
            await storage.transactions.create({ id: '0', sender: '~', receiver: keys[0].publicKey, amount: 0, signature: '' });

            const spy = jest.spyOn(storage.transactions, 'create');
            const event = events[0];

            await digester.do([event]);

            expect(spy).not.toBeCalled();
        });

        it('copy\'s the events timestamp to the transaction', async () => {
            //
            await storage.transactions.create({ id: '0', sender: '~', receiver: keys[0].publicKey, amount: 100, signature: '' });

            const event = events[0];

            await digester.do([event]);

            const result = await storage.transactions.index(null, 1);

            expect(result[0].timestamp).toBe(event.timestamp);
        });

        it('adds the events index to the last stored index in storage', async () => {
            //
            await storage.transactions.create({ id: '0', sender: '~', receiver: keys[0].publicKey, amount: 100, signature: '' });

            const event = events[0];

            await digester.do([event]);

            const result = await storage.transactions.index(null, 1);

            expect(result[0].index).toBe(1);
        });

        it('adds sequential indexes when the event contains multiple transactions', async () => {
            //
            await storage.transactions.create({ id: '0', index: 0, sender: '~', receiver: keys[0].publicKey, amount: 100, signature: '' });
            await storage.transactions.create({ id: '1', index: 1, sender: '~', receiver: keys[1].publicKey, amount: 100, signature: '' });

            const event = { ...events[0] };
            event.data = [transactions[0], transactions[1]];

            await digester.do([event]);

            const result = await storage.transactions.index(null, 2);

            expect(result[0].index).toBe(3);
            expect(result[1].index).toBe(2);
        });

        it('adds sequential indexes when multiple events are provided', async () => {
            //
            await storage.transactions.create({ id: '0', index: 0, sender: '~', receiver: keys[0].publicKey, amount: 100, signature: '' });
            await storage.transactions.create({ id: '1', index: 1, sender: '~', receiver: keys[1].publicKey, amount: 100, signature: '' });

            await digester.do([events[0], events[1]]);

            const result = await storage.transactions.index(null, 2);

            expect(result[0].index).toBe(3);
            expect(result[1].index).toBe(2);
        });

        it('ignores a transaction when the sender and signature don\'t match', async () => {
            //
            await storage.transactions.create({ id: '0', index: 0, sender: '~', receiver: keys[0].publicKey, amount: 100, signature: '' });

            const spy = jest.spyOn(storage.transactions, 'create');

            const transaction = { ...transactions[0] };
            transaction.signature = crypto.createSignature(transaction, keys[1].privateKey);

            const event = { ...events[0] };
            event.data = [transaction];

            await digester.do([event]);

            expect(spy).not.toBeCalled();
        });
    });

    // describe('do', () => {

    //     it('executes a transaction when the sender has enough balance', async () => {
    //         await storage.transactions.create({ id: '0', sender: '~', receiver: 'piet', amount: 102, signature: '' });

    //         const spy = jest.spyOn(storage.transactions, 'create');
    //         const event = events[0];

    //         await digester.do([event]);

    //         expect(spy).toBeCalled();
    //     });

    //     it('does not execute a transaciton when the sender does not have enough balance', async () => {
    //         await storage.transactions.create({ id: '0', sender: '~', receiver: 'piet', amount: 100, signature: '' });

    //         const spy = jest.spyOn(storage.transactions, 'create');
    //         const event = events[0];

    //         await digester.do([event]);

    //         expect(spy).not.toBeCalled();
    //     });

    //     it('sets the transaction\'s timestamp to the event\'s timestamp', async () => {
    //         await storage.transactions.create({ id: '0', sender: '~', receiver: 'geert', amount: 100, signature: '' });

    //         const event = events[4];

    //         await digester.do([event]);

    //         const transactions = await storage.transactions.index();

    //         expect(transactions[0].timestamp).toBe(event.timestamp);
    //     });

    //     it.todo('does execute the transaction when it is from `~` and the user can receive again');

    //     it.todo('does not execute the transactionw hen it is from `~` and the can\'t receive again');

    //     it('does not execute the transaciton when the creator does not match the sender', async () => {
    //         await storage.transactions.create({ id: '0', sender: '~', receiver: 'geert', amount: 100, signature: '' });

    //         const spy = jest.spyOn(storage.transactions, 'create');
    //         const event = events[4];

    //         // Sign the transaction with a random private key.
    //         const { privateKey } = crypto.createKeys();
    //         event.data[0].signature = crypto.createSignature(event.data[0], privateKey);

    //         await digester.do([event]);

    //         expect(spy).not.toBeCalled();
    //     });
    // });
});