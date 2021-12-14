import { Database } from 'sqlite3';

export class States {
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