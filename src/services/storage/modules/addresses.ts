import { Database } from 'sqlite3';

export class Addresses {
	/**
	 * The database.
	 */
	private database: Database;
	
	/**
	  * Class constructor.
	  */
	constructor(database: Database) {
		this.database = database;
	}
}