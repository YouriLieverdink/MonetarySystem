import {Database} from 'sqlite3';
import {Service} from 'typedi';
import {Address} from '../../types/address';
import {Event} from '../../types/event';
import {Node} from '../../types/node';
import {State} from '../../types/state';


@Service()
export class StorageService {
    /**
     * The database.
     */
    private database: Database;

    /**
     * The query methods.
     */
    private readonly query = {
        /**
         * Insert, update, and delete queries.
         *
         * @param sql The query.
         * @param params Parameters used in the query.
         * @returns A promise.
         */
        run: (sql: string, ...params: unknown[]): Promise<void> => {
            return new Promise((resolve, reject) => {
                this.database.run(sql, params, (err) => {
                    if (err) reject(err);

                    resolve();
                });
            });
        },
        /**
         * Read single row.
         *
         * @param sql The query.
         * @param params Parameters used in the query.
         * @returns A promise.
         */
        get: <T>(sql: string, ...params: unknown[]): Promise<T> => {
            return new Promise((resolve, reject) => {
                if (params === undefined) params = [];

                this.database.get(sql, params, (err, res) => {
                    if (err) reject(err);

                    resolve(res);
                });
            });
        },
        /**
         * All rows.
         *
         * @param sql The query.
         * @param params Parameters used in the query.
         * @returns A promise.
         */
        all: <T>(sql: string, ...params: unknown[]): Promise<T[]> => {
            return new Promise((resolve, reject) => {
                if (params === undefined) params = [];

                this.database.all(sql, params, (err, res) => {
                    if (err) reject(err);

                    resolve(res);
                });
            });
        },
    };

    /**
     * The address methods.
     */
    public readonly addresses = {
        /**
         * Display a listing of the resource.
         *
         * @throws {Error} When an exception occurs.
         */
        index: async (): Promise<Address[]> => {
            return await this.query.all<Address>('SELECT * FROM addresses');
        },
        /**
         * Display the specified resource.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        read: async (publicKey: string): Promise<Address> => {
            return await this.query.get<Address>('SELECT * FROM addresses WHERE public_key = ?', publicKey);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param publicKey The public key of the address.
         * @param privateKey The private key of the address.
         * @param isDefault Whether the address should be used as default.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (publicKey: string, privateKey: string, isDefault = true): void => {
            this.query.run('INSERT INTO addresses VALUES (?, ?, ?)', publicKey, privateKey, isDefault);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param publicKey The public key of the address.
         * @param isDefault Whether the address should be used as default.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (publicKey: string, isDefault: boolean): void => {
            this.query.run('UPDATE addresses SET is_default = ? WHERE public_key = ?', isDefault, publicKey);
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (publicKey: string): void => {
            this.query.run('DELETE FROM addresses WHERE public_key = ?', publicKey);
        },
    };

    /**
     * The events methods.
     */
    public readonly events = {
        /**
         * Display a listing of the resource.
         *
         * @throws {Error} When an exception occurs.
         */
        index: async (): Promise<Event[]> => {
            return await this.query.all<Event>('SELECT * FROM events');
        },
        /**
         * Display the specified resource.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        read: async (id: number): Promise<Event> => {
            return await this.query.get<Event>('SELECT * FROM events WHERE id = ?', id);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param publicKey The public key of the address.
         * @param privateKey The private key of the address.
         * @param isDefault Whether the address should be used as default.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (type: string, data: Record<string, unknown>, otherParent: string, selfParent: string, signature: string, date: Date): void => {
            this.query.run('INSERT INTO events ("type","data","other_parent","self_parent","signature","date") VALUES (?, ?, ?, ?, ?, ?)', type, data, otherParent, selfParent, signature, date);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param publicKey The public key of the address.
         * @param isDefault Whether the address should be used as default.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (type: string, data: Record<string, unknown>, otherParent: string, selfParent: string, signature: string, date: Date, id: number): void => {
            this.query.run('UPDATE events SET type = ?, data = ?, other_parent = ?, self_parent = ?, signature = ?, date = ? WHERE id = ?', type, data, otherParent, selfParent, signature, date, id);
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param id The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (id: number): void => {
            this.query.run('DELETE FROM events WHERE id = ?', id);
        },
    };

    /**
     * The node methods.
     */
    public readonly nodes = {
        /**
         * Display a listing of the resource.
         *
         * @throws {Error} When an exception occurs.
         */
        index: async (): Promise<Node[]> => {
            return await this.query.all<Node>('SELECT * FROM nodes');
        },
        /**
         * Display the specified resource.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        read: async (host: string): Promise<Node> => {
            return await this.query.get<Node>('SELECT * FROM nodes WHERE host = ?', host);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param publicKey The public key of the address.
         * @param privateKey The private key of the address.
         * @param isDefault Whether the address should be used as default.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (host: string, name: string): void => {
            this.query.run('INSERT INTO nodes VALUES (?, ?)', host, name);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param publicKey The public key of the address.
         * @param isDefault Whether the address should be used as default.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (host: string, name: boolean): void => {
            this.query.run('UPDATE nodes SET name = ? WHERE host = ?', name, host)
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (host: string): void => {
            this.query.run('DELETE FROM nodes WHERE host = ?', host)
        },
    };

    /**
     * The state methods.
     */
    public readonly states = {
        /**
         * Display a listing of the resource.
         *
         * @throws {Error} When an exception occurs.
         */
        index: async (): Promise<State[]> => {
            return await this.query.all<State>('SELECT * FROM states')
        },
        /**
         * Display the specified resource.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        read: async (address: string): Promise<State> => {
            return await this.query.get<State>('SELECT * FROM states WHERE address = ?', address)
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param publicKey The public key of the address.
         * @param privateKey The private key of the address.
         * @param isDefault Whether the address should be used as default.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (address: string, balance: string, date: Date): void => {
            this.query.run('INSERT INTO states VALUES (?, ?, ?)', address, balance, date)
        },
        /**
         * Update the specified resource in storage.
         *
         * @param publicKey The public key of the address.
         * @param isDefault Whether the address should be used as default.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (address: string, balance: string, date: Date): void => {
            this.query.run('UPDATE states SET balance = ?, date = ? WHERE address = ?', balance, date, address)
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (address: string): void => {
            this.query.run('DELETE FROM states WHERE address = ?', address)
        },
    };

    /**
     * Class constructor.
     */
    constructor() {
        this.database = new Database('db.sqlite3');
        this.constructTables();
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
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				type VARCHAR(16),
				data BLOB,
				other_parent TEXT,
				self_parent TEXT,
				signature TEXT,
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
