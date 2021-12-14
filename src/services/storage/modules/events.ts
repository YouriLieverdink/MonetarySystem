import { Database } from 'sqlite3';

export class Events {
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