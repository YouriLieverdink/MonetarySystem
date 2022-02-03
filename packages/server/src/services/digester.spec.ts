import { Database } from 'sqlite3';
import { Transaction } from "../types/transaction";
import { _Event } from "./consensus";
import { Digester } from './digester';
import { Storage } from "./storage";

describe('Digester', () => {
    let database: Database;
    let storage: Storage;
    let digester: Digester;
    let events: _Event<Transaction[]>[];

    beforeAll(() => {
        // Create the test events.
        events = [];

        const publicKeys: string[] = [
            'piet', 'henk', 'klaas', 'jan', 'geert', 'hacker',
        ];

        const transactions: Transaction[] = [
            { id: '1', sender: 'piet', receiver: 'henk', amount: 101 },
            { id: '2', sender: 'henk', receiver: 'klaas', amount: 34 },
            { id: '3', sender: 'klaas', receiver: 'jan', amount: 59 },
            { id: '4', sender: 'jan', receiver: 'geert', amount: 32 },
            { id: '5', sender: 'geert', receiver: 'piet', amount: 18 },
            { id: '6', sender: 'piet', receiver: 'hacker', amount: 18 },
        ];

        for (let i = 0; i < transactions.length; i++) {
            //
            events.push({
                id: `${i}`,
                index: i,
                createdAt: 0,
                timestamp: 0,
                publicKey: publicKeys[i],
                signature: '',
                data: [transactions[i]],
            });
        }
    });

    beforeEach(() => {
        database = new Database(':memory:');
        storage = new Storage(database);
        digester = new Digester(storage);
    });

    describe('do', () => {

        it('executes a transaction when the sender has enough balance', async () => {
            await storage.transactions.create({ id: '0', sender: '~', receiver: 'piet', amount: 102 });

            const spy = jest.spyOn(storage.transactions, 'create');
            const event = events[0];

            await digester.do([event]);

            expect(spy).toBeCalled();
        });

        it('does not execute a transaciton when the sender does not have enough balance', async () => {
            await storage.transactions.create({ id: '0', sender: '~', receiver: 'piet', amount: 100 });

            const spy = jest.spyOn(storage.transactions, 'create');
            const event = events[0];

            await digester.do([event]);

            expect(spy).not.toBeCalled();
        });

        it('assigns the transactions the index of their event', async () => {
            await storage.transactions.create({ id: '0', sender: '~', receiver: 'geert', amount: 100 });

            const event = events[4];

            await digester.do([event]);

            const transactions = await storage.transactions.index();

            expect(transactions[0].index).toBe(event.index);
        });

        it('assigns the order based on the location of the transaction in the event', async () => {
            await storage.transactions.create({ id: '99', sender: '~', receiver: 'piet', amount: 1000 });
            await storage.transactions.create({ id: '98', sender: '~', receiver: 'henk', amount: 1000 });

            const event = events[0];
            event.data = [...events[0].data, ...events[1].data];

            await digester.do([event]);

            const transactions = await storage.transactions.index();

            expect(transactions[0].order).toBe(2);
            expect(transactions[1].order).toBe(1);
        });

        it('sets the transaction\'s timestamp to the event\'s timestamp', async () => {
            await storage.transactions.create({ id: '0', sender: '~', receiver: 'geert', amount: 100 });

            const event = events[4];

            await digester.do([event]);

            const transactions = await storage.transactions.index();

            expect(transactions[0].timestamp).toBe(event.timestamp);
        });

        it.todo('does exceute the transaction when it is from `~` and the user can receive again');

        it.todo('does not execute the transactionw hen it is from `~` and the can\'t receive again');

        it.todo('does not execute the transaciton when the creator does not match the sender');
    });
});