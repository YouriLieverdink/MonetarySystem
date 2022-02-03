import { Database } from 'sqlite3';
import { Storage } from '../services/_';
import { Address, Transaction } from '../types/_';

describe('Storage', () => {
    //
    let database: Database;
    let storage: Storage;

    beforeEach(() => {
        // Initialise a new in-memory database for every test.
        database = new Database(':memory:');
        storage = new Storage(database);
    });

    describe('addresses', () => {
        const items: Address[] = [
            { publicKey: `1`, privateKey: 'key' },
            { publicKey: `2`, privateKey: 'key' },
            { publicKey: `3`, privateKey: 'key' }
        ];

        describe('index', () => {

            it('should call database.all', async () => {
                const spy = jest.spyOn(database, 'all');

                await storage.addresses.index();

                expect(spy).toBeCalled();
            });

            it('should return an empty list when no items are stored in the database', async () => {
                const result = await storage.addresses.index();

                expect(result.length).toEqual(0);
            });

            it('should return a populated list when items are stored in the database', async () => {
                for (const { publicKey, privateKey } of items) {
                    await storage.query.run(
                        'INSERT INTO addresses VALUES (?, ?)',
                        publicKey, privateKey,
                    );
                }

                const result = await storage.addresses.index();

                expect(result.length).toEqual(items.length);
            });
        });

        describe('read', () => {

            it('should call database.get', async () => {
                const spy = jest.spyOn(database, 'get');

                await storage.addresses.read('0');

                expect(spy).toBeCalled();
            });

            it('should return undefined when the item was not found', async () => {
                const result = await storage.addresses.read('0');

                expect(result).toBeUndefined();
            });

            it('should return the correct item', async () => {
                for (const { publicKey, privateKey } of items) {
                    await storage.query.run(
                        'INSERT INTO addresses VALUES (?, ?)',
                        publicKey, privateKey,
                    );
                }

                const item = items[0];

                const result = await storage.addresses.read(item.publicKey);

                expect(result.publicKey).toEqual(item.publicKey);
                expect(result.privateKey).toEqual(item.privateKey);
            });
        });

        describe('create', () => {

            it('should call database.run', async () => {
                const spy = jest.spyOn(database, 'run');

                await storage.addresses.create({ publicKey: '4', privateKey: 'key' });

                expect(spy).toBeCalled();
            });

            it('should create and store the item in the database', async () => {
                const item = items[0];

                await storage.addresses.create(item);

                const address = await storage.query.get(
                    'SELECT * FROM addresses WHERE publicKey=?',
                    item.publicKey,
                )

                expect(address).toEqual(item);
            });

            it('should throw an error when the public key already exists', async () => {
                const item = items[0];

                await storage.query.run(
                    'INSERT INTO addresses VALUES (?, ?)',
                    item.publicKey, item.privateKey,
                );

                expect(() => storage.addresses.create(item)).rejects;
            });
        });

        describe('destroy', () => {

            it('should call database.run', async () => {
                const spy = jest.spyOn(database, 'run');

                await storage.addresses.destroy('0');

                expect(spy).toBeCalled();
            });

            it('should delete the item from the database', async () => {
                const item = items[0];

                await storage.query.run(
                    'INSERT INTO addresses VALUES (?, ?)',
                    item.publicKey, item.privateKey,
                );

                await storage.addresses.destroy('1');

                const address = await storage.query.get(
                    'SELECT * FROM addresses WHERE publicKey=?',
                    item.publicKey,
                );

                expect(address).toBe(undefined);
            });
        });
    });

    describe('transactions', () => {

        const items: Transaction[] = [
            { id: '0', timestamp: 0, index: 0, sender: `~`, receiver: 'Monkey', amount: 1 },
            { id: '1', timestamp: 0, index: 1, sender: `~`, receiver: 'Dog', amount: 1 },
            { id: '2', timestamp: 0, index: 2, sender: `~`, receiver: 'Sheep', amount: 1 },
        ];

        describe('index', () => {

            it('calls database.all', async () => {
                const spy = jest.spyOn(database, 'all');

                await storage.transactions.index();

                expect(spy).toBeCalled();
            });

            it('returns only transactions of `publicKey` when provided', async () => {
                for (const item of items) {
                    await storage.query.run(
                        'INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?)',
                        item.id, item.timestamp, item.index, item.receiver, item.sender, item.amount,
                    );
                }

                const result = await storage.transactions.index('Monkey');

                expect(result.length).toBe(1);
            });

            it('returns transactions ordered by `index`', async () => {
                for (const item of items) {
                    await storage.query.run(
                        'INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?)',
                        item.id, item.timestamp, item.index, item.receiver, item.sender, item.amount,
                    );
                }

                const result = await storage.transactions.index();

                const indexes = result.map((v) => v.index);

                expect(indexes).toEqual([2, 1, 0]);
            });

            it('returns a limited amount when limit is provided', async () => {
                for (const item of items) {
                    await storage.query.run(
                        'INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?)',
                        item.id, item.timestamp, item.index, item.receiver, item.sender, item.amount,
                    );
                }

                const result = await storage.transactions.index(null, 1);

                expect(result.length).toBe(1);
            });

            it('returns the transactions after offset when offset is provided', async () => {
                for (const item of items) {
                    await storage.query.run(
                        'INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?)',
                        item.id, item.timestamp, item.index, item.receiver, item.sender, item.amount,
                    );
                }

                const result = await storage.transactions.index(null, 3, 2);

                expect(result.length).toBe(1);
            });
        });

        describe('create', () => {

            it('should call database.run', async () => {
                const spy = jest.spyOn(database, 'run');

                await storage.transactions.create(items[0]);

                expect(spy).toBeCalled();
            });

            it('should create and store the item in the database', async () => {
                await storage.transactions.create(items[0]);

                const transaction = await storage.query.get(
                    'SELECT * FROM transactions WHERE id=?',
                    items[0].id,
                )

                expect(transaction).toEqual(items[0]);
            });

            it('should throw an error when the id already exists', async () => {
                const item = items[0];

                await storage.query.run(
                    'INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?)',
                    item.id, item.timestamp, item.index, item.receiver, item.sender, item.amount,
                );

                expect(() => storage.transactions.create(item)).rejects;
            });
        });
    });
});