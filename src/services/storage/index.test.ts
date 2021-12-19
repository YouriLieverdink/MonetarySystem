import { Database } from 'sqlite3';
import { Address } from '../../types/address';
import Container from 'typedi';
import { StorageService } from './index';

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
				}).rejects.toThrow();
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
});