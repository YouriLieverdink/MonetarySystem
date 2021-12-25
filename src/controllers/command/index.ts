import { Express } from 'express';
import readline from 'readline';
import Container from 'typedi';
import { ApiService, CliService, QueueService, StorageService } from '../../services';
import { Address, State, Transaction } from '../../types';

export class CommandController {
	/**
	 * Used to store events which contain a consensus timestamp.
	 */
	private storageService: StorageService;

	/**
	 * Incoming transactions from the operating user.
	 */
	private transactionsQueue: QueueService<Transaction>;

	/**
	 * Class constructor.
	 */
	constructor() {
		// Inject dependencies.
		this.storageService = Container.get<StorageService>('storage');
		this.transactionsQueue = Container.get<QueueService<Transaction>>('transactions');

		this.initApi();
		this.initCli();
	}

	/**
	 * Initialise the api handling.
	 */
	private initApi(): void {
		const apiService = new ApiService(this);
		const express = Container.get<Express>('express');
		express.get('/api/*', apiService.handle);
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
		getAll: (): Promise<Address[]> => {
			//
			throw Error('Not implemented');
		},
		/**
		 * Creates a new address.
		 * 
		 * @returns The private key of the address.
		 */
		create: async (): Promise<Address> => {
			//
			throw Error('Not implemented');
		},
		/**
		 * Import an existing address.
		 * 
		 * @param privateKey The private key of the address to add.
		 * @returns Whether the operation was successfull.
		 */
		import: async (privateKey: string): Promise<boolean> => {
			//
			throw Error('Not implemented');
		},
		/**
		 * Remove an address from the local node.
		 * 
		 * @param publicKey The public key of the address to remove.
		 * @returns Whether the operation was successfull.
		 */
		remove: async (publicKey: string): Promise<boolean> => {
			//
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
		getAllImported: async (): Promise<Transaction[]> => {
			return (await Promise.all((await this.addresses.getAll())
				.flatMap(address => this.transactions.getAll(address.publicKey))))
				.flatMap(tx => tx);
		},
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
		getAll: async (): Promise<State[]> => {
			//
			throw Error('Not implemented');
		},
		/**
		 * Gets all the states of the imported addresses.
		 *
		 * @returns A list of states.
		 */
		getAllImported: async (): Promise<State[]> => {
			return Promise.all((await this.addresses.getAll()).flatMap(address => this.balances.get(address.publicKey)));
		},
		/**
		 * Gets the state for a given address.
		 * 
		 * @param publicKey The public key of the address.
		 * @returns A state.
		 */
		get: async (publicKey: string): Promise<State> => {
			//
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