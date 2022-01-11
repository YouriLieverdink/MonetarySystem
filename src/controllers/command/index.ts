import crypto from 'crypto';
import { Express } from 'express';
import readline from 'readline';
import Container from 'typedi'; Queue;
import { ApiService, CliService, QueueService, StorageService } from '../../services';
import { CryptoService } from '../../services/crypto';
import { Address, State, Transaction } from '../../types';

export class CommandController {
	/** Used to store events which contain a consensus timestamp. */
	private storageService: StorageService;

	/** Used to access cryptographic functions. */
	private cryptoService: CryptoService;

	/** Incoming transactions fQueueating user. */
	private transactionsQueue: QueueService<Transaction>;

	/** Class constructor. */
	constructor() {
		// Inject dependencies.
		this.storageService = Container.get<StorageService>('storage');
		this.cryptoService = Container.get<CryptoService>('crypto');
		this.transactionsQueue = Container.get<Queue<Transaction>>('transactions');

		this.initApi();
		this.initCli();
	}

	/** Initialise the api handling. */
	private initApi(): void {
		const apiService = new ApiService(this);
		const express = Container.get<Express>('express');
		express.get('/api/*', apiService.handle);
	}

	/** Initialise the cli handling. */
	private initCli(): void {
		const cliService = new CliService(this, console);
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		const ask = () => rl.question(
			'\x1b[0mtritium> ',
			async (command) => {
				await cliService.handle(command);
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
		getAll: (): Promise<Address[]> =>
			this.storageService.addresses.index(),
		/**
		 * Creates a new address.
		 * 
		 * @returns The private key of the address.
		 */
		create: async (): Promise<Address> => {
			const keyPair = this.cryptoService.generateKeys();

			return this.storageService.addresses.create(keyPair.publicKey, keyPair.privateKey, false)
				.then(() => keyPair)
				.catch(() => null);
		},
		/**
		 * Import an existing address.
		 * 
		 * @param privateKey The private key of the address to add.
		 * @returns publicKey if the operation was successfull, null if not
		 */
		import: async (privateKey: string): Promise<boolean> => {
			const publicKey = this.cryptoService.getPublicKey(privateKey);

			if (publicKey == null)
				return null;

			return (await this.storageService.addresses.index()).map(a => a.publicKey).includes(publicKey)
				? false
				: this.storageService.addresses.create(publicKey, privateKey, false)
					.then(() => true)
					.catch(() => null);
		},
		/**
		 * Remove an address from the local node.
		 * 
		 * @param publicKey The public key of the address to remove.
		 * @returns Whether the operation was successfull.
		 */
		remove: async (publicKey: string): Promise<boolean> =>
			this.storageService.addresses.destroy(publicKey)
				.then(() => true)
				.catch(() => false)
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
		getAll: async (publicKey: string): Promise<Transaction[]> =>
			this.storageService.transactions.index(publicKey),
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
		 * @returns Whether the operation was successful.
		 */
		create: (publicKeySender: string, publicKeyReceiver: string, amount: number): true => {
			this.transactionsQueue.push({
				from: publicKeySender,
				to: publicKeyReceiver,
				amount: amount,
				node: null
			});
			return true;
		}
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
		getAll: async (): Promise<State[]> =>
			this.storageService.states.index(),
		/**
		 * Gets all the states of the imported addresses.
		 *
		 * @returns A list of states.
		 */
		getAllImported: async (): Promise<State[]> =>
			Promise.all((await this.addresses.getAll()).flatMap(async address => await this.balances.get(address.publicKey))),
		/**
		 * Gets the state for a given address.
		 * 
		 * @param publicKey The public key of the address.
		 * @returns A state.
		 */
		get: async (publicKey: string): Promise<State> =>
			this.storageService.states.read(publicKey)
	};

	/**
	 * The mirror methods.
	 */
	public readonly mirror = {
		/**
		 * Gets the mirroring enabled/disabled status.
		 */
		get: async (): Promise<boolean> =>
			await this.storageService.settings.get('mirror')
				.then(v => v)
				.catch(() => false),

		/**
		 * Sets the mirroring option.
		 * 
		 * @param value The value to set.
		 */
		set: async (value: boolean): Promise<boolean> =>
			await this.storageService.settings.set('mirror', value)
				.then(() => true)
				.catch(() => false)
	};
}