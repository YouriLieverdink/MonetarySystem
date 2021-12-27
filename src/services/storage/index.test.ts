import { Database } from 'sqlite3';
import Container from 'typedi';
import { Address, Event } from '../../types';
import { StorageService } from './index';
import mock = jest.mock;

describe('StorageService', () => {
	//
	let database: Database;
	let storage: StorageService;

	beforeEach(() => {
		// Initialise a new in-memory datbase for every test.
		database = new Database(':memory:');
		Container.set(Database, database);

		storage = new StorageService();
	});

	describe('addresses', () => {
		const mockPublicKey = 'mock-public-key';
		const mockPrivateKey = 'mock-private-key';
		const mockIsDefault = 0;

		describe('index', () => {

			it('should call database.all', async () => {
				const spy = jest.spyOn(database, 'all');

				await storage.addresses.index();

				expect(spy).toBeCalled();
			});

			it('should return an empty list when no items are stored in the database', async () => {
				const result = await storage.addresses.index();

				expect(result).toEqual(result);
			});

			it('should return a populated list when items are stored in the database', async () => {
				const items: Address[] = [
					{ 'publicKey': 'public1', 'privateKey': 'private1', isDefault: 0 },
					{ 'publicKey': 'public2', 'privateKey': 'private2', isDefault: 0 },
					{ 'publicKey': 'public3', 'privateKey': 'private3', isDefault: 0 },
				];

				// Add the items to the database.
				database.serialize(() => {
					const statement = database.prepare('INSERT INTO addresses VALUES (?, ?, ?)');

					items.forEach((address) => {
						statement.run(address.publicKey, address.privateKey, address.isDefault);
					});

					statement.finalize();
				});

				const result = await storage.addresses.index();

				expect(result).toEqual(items);
			});
		});

		describe('read', () => {

			it('should call database.get', async () => {
				const spy = jest.spyOn(database, 'get');

				await storage.addresses.read(mockPublicKey);

				expect(spy).toBeCalled();
			});

			it('should return undefined when the item was not found', async () => {
				const result = await storage.addresses.read(mockPublicKey);

				expect(result === undefined).toBeTruthy();
			});

			it('should return the correct item', async () => {
				const items: Address[] = [
					{ 'publicKey': 'public1', 'privateKey': 'private1', isDefault: 0 },
					{ 'publicKey': 'public2', 'privateKey': 'private2', isDefault: 0 },
					{ 'publicKey': 'public3', 'privateKey': 'private3', isDefault: 0 },
				];

				// Add the items to the database.
				database.serialize(() => {
					const statement = database.prepare('INSERT INTO addresses VALUES (?, ?, ?)');

					items.forEach((address) => {
						statement.run(address.publicKey, address.privateKey, address.isDefault);
					});

					statement.finalize();
				});

				const result = await storage.addresses.read(items[0].publicKey);

				expect(result).toEqual(items[0]);
			});
		});

		describe('create', () => {

			it('should call database.run', async () => {
				const spy = jest.spyOn(database, 'run');

				await storage.addresses.create(mockPublicKey, mockPrivateKey, mockIsDefault);

				expect(spy).toBeCalled();
			});

			it('should create and store the item in the database', async () => {
				const item: Address = {
					'publicKey': mockPublicKey,
					'privateKey': mockPrivateKey,
					'isDefault': mockIsDefault,
				};

				await storage.addresses.create(mockPublicKey, mockPrivateKey, mockIsDefault);

				const result = await storage.addresses.read(mockPublicKey);
				expect(result).toEqual(item);
			});

			it('should throw an error when the public key already exists', async () => {
				database.run(
					'INSERT INTO addresses VALUES (?, ?, ?)',
					[mockPublicKey, mockPrivateKey, mockIsDefault],
				);

				expect(async () => {
					await storage.addresses.create(mockPublicKey, mockPrivateKey, mockIsDefault);
				}).rejects;
			});
		});

		describe('update', () => {

			it('should call database.run', async () => {
				const spy = jest.spyOn(database, 'run');

				await storage.addresses.update(mockPublicKey, mockIsDefault);

				expect(spy).toBeCalled();
			});

			it('should update the item in the database', async () => {
				database.run(
					'INSERT INTO addresses VALUES (?, ?, ?)',
					[mockPublicKey, mockPrivateKey, 0],
				);

				await storage.addresses.update(mockPublicKey, 1);

				const result = await storage.addresses.read(mockPublicKey);

				expect(result.isDefault).toEqual(1);
			});
		});

		describe('destroy', () => {

			it('should call database.run', async () => {
				const spy = jest.spyOn(database, 'run');

				await storage.addresses.destroy(mockPublicKey);

				expect(spy).toBeCalled();
			});

			it('should delete the item from the database', async () => {
				database.run(
					'INSERT INTO addresses VALUES (?, ?, ?)',
					[mockPublicKey, mockPrivateKey, 0],
				);

				await storage.addresses.destroy(mockPublicKey);

				const result = await storage.addresses.read(mockPublicKey);

				expect(result).toBeUndefined();
			});
		});
	});
//INSERT INTO events (type, data, otherParent, selfParent, signature, date) VALUES ('transaction', '{ "node": { "host": "1.1.1.1:1", "name": "piet" }, "from": "henk", "to": "henk", "amount": 12 }', 'jan', 'klaas', 'transaction1', '2021-12-27T13:37:29.131Z');
	describe('events', () => {
		const mockJson = { 'node': { 'host': '1.1.1.1:1', 'name': 'piet' }, 'from': 'straat1', 'to': 'straat2', 'amount': 12 };
		const mockJson1 = { 'node': { 'host': '1.1.1.1:1', 'name': 'jan' }, 'from': 'straat2', 'to': 'straat3', 'amount': 12 };
		const mockJson2 = { 'node': { 'host': '1.1.1.1:1', 'name': 'geert' }, 'from': 'straat2', 'to': 'straat1', 'amount': 12 };


		describe('transactions', () => {

			it('should return the correct item', async () => {
				// Add the items to the database.
				await storage.events.create('transaction', mockJson, 'fret', 'piet', 'transaction1', new Date);
				await storage.events.create('transaction', mockJson1, 'jan', 'klaas', 'transaction2', new Date);
				await storage.events.create('transaction', mockJson2, 'fret','geert', 'transaction3', new Date);

				const result = await storage.events.transactions('straat1');
				expect(result[0].data.from).toEqual('straat1');
				expect(result[1].data.to).toEqual('straat1');

			});
		});
	});
});