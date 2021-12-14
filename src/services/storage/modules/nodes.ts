import { Database } from 'sqlite3';

export class Nodes {
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