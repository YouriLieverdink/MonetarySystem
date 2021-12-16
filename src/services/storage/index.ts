import {Database} from 'sqlite3';
import {Service} from 'typedi';

@Service()
export class StorageService {
    /**
     * The database.
     */
    private database: Database;

    /**
     * The address methods.
     */
    public readonly addresses = {};

    /**
     * The events methods.
     */
    public readonly events = {};

    /**
     * The node methods.
     */
    public readonly nodes = {
        getHostByName(service, name): any {
            return service.all(
                `SELECT * FROM nodes WHERE name = ?`,
                [name]);
        }

    };

    /**
     * The state methods.
     */
    public readonly states = {};

    /**
     * Class constructor.
     */
    constructor() {
        this.database = new Database('db.sqlite3');
        this.constructTables();
        this.nodes.getHostByName(this,'henk').then((value) => {
            console.log(value)
        })
    }

    /**
     * Constructs the table for the database.
     */
    private constructTables(): void {
        this.database.run(`
			CREATE TABLE IF NOT EXISTS addresses (
				public_key VARCHAR(32),
				private_key VARCHAR(32),
				is_default BOOLEAN
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

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.database.all(sql, params, (err, rows) => {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    console.log(err)
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }
}

