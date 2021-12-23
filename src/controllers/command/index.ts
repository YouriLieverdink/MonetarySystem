import { Container, Service } from 'typedi';
import { StorageService } from '../../services';
import { Address, State, Transaction } from '../../types';

@Service()
export class CommandController {

	/** StorageService injection. */
	private storageService = Container.get(StorageService);

	/**
	 * The address methods.
	 */
	public readonly addresses = {
		/**
		 * Gets all the stored addresses.
		 * 
		 * @returns A list of addresses.
		 */
		getAll: (): Promise<Address[]> => this.storageService.addresses.index(),

		/**
		 * Creates a new address.
		 * 
		 * @returns The private key of the address.
		 */
		create: async (): Promise<Address> => {
			/**
			 * Steps:
			 * 1. Create a new public/private key combination.
			 * 2. Store the address in the database.
			 * 3. Return the address.
			 */
			// todo generate key pair and store it in the database
			// return this.storageService.addresses.create()
			// 	.then(() => address)
			// 	.catch(() => null)
			throw Error('Not implemented');
		},
		/**
		 * Import an existing address.
		 * 
		 * @param privateKey The private key of the address to add.
		 * @returns Whether the operation was successfull.
		 */
		import: async (privateKey: string): Promise<boolean> => {
			/**
			 * Steps:
			 * 1. Figure out the public key using the private key.
			 * 2. Store the address in the database.
			 * 3. Return true.
			 */
			// todo derive public key from privat key and store them in the database
			// return this.storageService.addresses.create()
			// 	.then(() => true)
			// 	.catch(() => false)
			throw Error('Not implemented');
		},
		/**
		 * Remove an address from the local node.
		 * 
		 * @param publicKey The public key of the address to remove.
		 * @returns Whether the operation was successfull.
		 */
		remove: async (publicKey: string): Promise<boolean> =>
			this.storageService.addresses.destroy(publicKey).then(() => true).catch(() => false),
	};

	/**
	 * The transaction methods.
	 */
	public readonly transactions = {
		/**
		 * Gets all the stored transactions for a given address.
		 * 
		 * @returns A list of transactions.
		 */
		getAll: async (publicKey: string): Promise<Transaction[]> => {
			/**
			 * Steps:
			 * 1. Retrieve all transactions for the given public key from the database.
			 * 2. Return the transactions.
			 */
			throw Error('Not implemented');
		},

		/**
		 * Gets all the stored transactions for the users' addresses.
		 *
		 * @returns A list of transactions.
		 */
		getAllImported: async (): Promise<Transaction[]> =>
			(await Promise.all((await this.addresses.getAll())
				.flatMap(address => this.transactions.getAll(address.publicKey))))
				.flatMap(tx => tx),

		/**
		 * Create a new transaction.
		 * 
		 * @param publicKeySender The public key of the sending address.
		 * @param publicKeyReceiver The public key of the receiving address.
		 * @param amount The amount to transfer.
		 * @returns Whether the operation was successfull.
		 */
		create: async (publicKeySender: string, publicKeyReceiver: string, amount: number): Promise<boolean> => {
			/**
			 * Steps:
			 * 1. Create a transaction object.
			 * 2. Sign the object.
			 * 3. Set the date field to now.
			 * 4. Send the transaction to the GossipService for distribution.
			 * 5. Return true.
			 */
			throw Error('Not implemented');
		},
	};

	/**
	 * The balance methods.
	 */
	public readonly balances = {
		/**
		 * Gets all the states.
		 * 
		 * @returns A list of states.
		 */
		getAll: (): Promise<State[]> => this.storageService.states.index(),

		/**
		 * Gets the state for a given address.
		 * 
		 * @param publicKey The public key of the address.
		 * @returns A state.
		 */
		get: (publicKey: string): Promise<State> => this.storageService.states.read(publicKey),

		/**
		 * Gets all the states of the imported addresses.
		 *
		 * @returns A list of states.
		 */
		getAllImported: async (): Promise<State[]> =>
			Promise.all((await this.addresses.getAll()).flatMap(address => this.balances.get(address.publicKey))),
	};

	/**
	 * The mirror methods.
	 */
	public readonly mirror = {
		/**
		 * Sets the mirroring option.
		 * 
		 * @param value The value to set.
		 * @returns Whether the operation was successful.
		 */
		set: async (value: boolean): Promise<boolean> => {
			/**
			 * Steps:
			 * 1. Update the value in the database.
			 * 2. Return true.
			 */
			throw Error('Not implemented');
		},
	};
}