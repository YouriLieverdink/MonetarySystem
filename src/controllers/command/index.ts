import { Express } from 'express';
import readline from 'readline';
import { Inject, Service } from 'typedi';
import { ApiService, CliService, QueueService, StorageService } from '../../services';
import { Address, State, Transaction } from '../../types';

@Service()
export class CommandController {
	/**
	 * The express application used to handle api requests.
	 */
	@Inject('express')
	private express: Express;

	/**
	 * Used to store events which contain a consensus timestamp.
	 */
	@Inject('storage')
	private storageService: StorageService;

	/**
	 * Incoming transactions from the operating user.
	 */
	@Inject('transactions')
	private transactionsQueue: QueueService<Transaction>;

	/**
	 * Class constructor.
	 */
	constructor() {
		//
		this.initApi();
		this.initCli();
	}

	/**
	 * Initialise the api handling.
	 */
	private initApi(): void {
		const apiService = new ApiService(this);
		this.express.get('/api/*', apiService.handle);
	}

	/**
	 * Initialise the cli handling.
	 */
	private initCli(): void {
		const cli = new CliService(this, console);
		const rl = readline.createInterface({
			'input': process.stdin,
			'output': process.stdout,
		});

		const ask = () => rl.question(
			'\x1b[0mtritium> ',
			async (command) => {
				await cli.handle(command);
				ask();
			},
		);

		ask();
	}

	/**
	 * The address methods.
	 */
	public readonly addresses = {
		/**
		 * Gets all the stored addresses.
		 * 
		 * @returns A list of addresses.
		 */
		getAll: async (): Promise<Address[]> => {
			/**
			 * Steps:
			 * 1. Retrieve the addresses from the database.
			 * 2. Return the addresses.
			 */
			throw Error('Not implemented');
		},
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
			throw Error('Not implemented');
		},
		/**
		 * Import an existing address.
		 * 
		 * @param privateKey The private key of the address to add.
		 * @returns Whether the operation was successfull.
		 */
		import: async (_privateKey: string): Promise<boolean> => {
			/**
			 * Steps:
			 * 1. Figure out the public key using the private key.
			 * 2. Store the address in the database.
			 * 3. Return true.
			 */
			throw Error('Not implemented');
		},
		/**
		 * Remove an address from the local node.
		 * 
		 * @param publicKey The public key of the address to remove.
		 * @returns Whether the operation was successfull.
		 */
		remove: async (_publicKey: string): Promise<boolean> => {
			/**
			 * Steps:
			 * 1. Remove the address from the database.
			 * 2. Return true.
			 */
			throw Error('Not implemented');
		},
	};

	/**
	 * The transaction methods.
	 */
	public readonly transactions = {
		/**
		 * Gets all the stored transactions for a given address.
		 * 
		 * @returns A list of addresses.
		 */
		getAll: async (_publicKey: string): Promise<Transaction[]> => {
			/**
			 * Steps:
			 * 1. Retrieve all transactions for the given public key from the database.
			 * 2. Return the transactions.
			 */
			throw Error('Not implemented');
		},
		/**
		 * Create a new transaction.
		 * 
		 * @param publicKeySender The public key of the sending address.
		 * @param publicKeyReceiver The public key of the receiving address.
		 * @param amount The amount to transfer.
		 * @returns Whether the operation was successfull.
		 */
		create: async (_publicKeySender: string, _publicKeyReceiver: string, _amount: number): Promise<boolean> => {
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
		getAll: async (): Promise<State[]> => {
			//
			throw Error('Not implemented');
		},
		/**
		 * Gets the state for a given address.
		 * 
		 * @param publicKey The public key of the address.
		 * @returns A state.
		 */
		get: async (_publicKey: string): Promise<State> => {
			/**
			 * Steps:
			 * 1. Retrieve the state for the given public key from the database.
			 * 2. Return the state.
			 */
			throw Error('Not implemented');
		},
	};

	/**
	 * The mirror methods.
	 */
	public readonly mirror = {
		/**
		 * Sets the mirroring option.
		 * 
		 * @param value The value to set.
		 * @returns Whether the operation was successfull.
		 */
		set: async (_value: boolean): Promise<boolean> => {
			/**
			 * Steps:
			 * 1. Update the value in the database.
			 * 2. Return true.
			 */
			throw Error('Not implemented');
		},
	};
}