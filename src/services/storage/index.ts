import { Addresses } from './modules/addresses';
import { Database } from 'sqlite3';
import { Events } from './modules/events';
import { Nodes } from './modules/nodes';
import { Service } from 'typedi';
import { States } from './modules/states';

@Service()
export class StorageService {
	/**
	 * The database.
	 */
	private database: Database;

	/**
	 * The addresses module.
	 */
	public readonly addresses: Addresses;

	/**
	 * The events module.
	 */
	public readonly events: Events;

	/**
	 * The nodes module.
	 */
	public readonly nodes: Nodes;

	/**
	 * The states module.
	 */
	public readonly states: States;
	
	/**
	 * Class constructor.
	 */
	constructor() {
		this.database = new Database('db.sqlite3');
		this.constructTables();

		// Initialise the modules.
		this.addresses = new Addresses(this.database);
		this.events = new Events(this.database);
		this.nodes = new Nodes(this.database);
		this.states = new States(this.database);
	}

	/**
	 * Constructs the table for the database.
	 */
	private constructTables(): void {
		this.database.run(`
			CREATE TABLE IF NOT EXISTS addresses (
				public_key VARCHAR(32),
				private_key VARCHAR(32)
			)
		`);

		this.database.run(`
			CREATE TABLE IF NOT EXISTS events (
				id INT,
				type VARCHAR(16),
				data BLOB,
				other_parent TEXT,
				self_parent TEXT,
				date DATETIME
			)
		`);

		this.database.run(`
			CREATE TABLE IF NOT EXISTS nodes (
				host VARCHAR(32),
				name VARCHAR(32)
			)
		`);

		this.database.run(`
			CREATE TABLE IF NOT EXISTS states (
				address VARCHAR(32),
				balance FLOAT,
				date DATETIME
			)
		`);
	}
}