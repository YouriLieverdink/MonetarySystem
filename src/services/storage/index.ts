import { Database } from 'sqlite3';
import Container, { Service } from 'typedi';
import { Address } from '../../types/address';
import { Event } from '../../types/event';
import { Node } from '../../types/node';
import { State } from '../../types/state';

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
        index: (): Promise<Address[]> => {
            return this.query.all<Address>('SELECT * FROM addresses');
        },
        /**
         * Display the specified resource.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        read: (publicKey: string): Promise<Address> => {
            return this.query.get<Address>('SELECT * FROM addresses WHERE publicKey = ?', publicKey);
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
        create: (publicKey: string, privateKey: string, isDefault: boolean | 0 | 1): Promise<void> => {
            return this.query.run('INSERT INTO addresses VALUES (?, ?, ?)', publicKey, privateKey, isDefault);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param publicKey The public key of the address.
         * @param isDefault Whether the address should be used as default.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (publicKey: string, isDefault: boolean | 0 | 1): Promise<void> => {
            return this.query.run('UPDATE addresses SET isDefault=? WHERE publicKey=?', isDefault, publicKey);
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (publicKey: string): Promise<void> => {
            return this.query.run('DELETE FROM addresses WHERE publicKey=?', publicKey);
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
        index: (): Promise<Event[]> => {
            return this.query.all<Event>('SELECT * FROM events');
        },
        /**
         * Display the specified resource.
         *
         * @param id The id of the event.
         *
         * @throws {Error} When an exception occurs.
         */
        read: (id: number): Promise<Event> => {
            return this.query.get<Event>('SELECT * FROM events WHERE id=?', id);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param date The date and time when the event occured.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (type: string, data: Record<string, unknown>, otherParent: string, selfParent: string, signature: string, date: Date): Promise<void> => {
            return this.query.run('INSERT INTO events (type, data, otherParent, selfParent, signature, date) VALUES (?, ?, ?, ?, ?, ?)', type, data, otherParent, selfParent, signature, date);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param id The id of the event.
         * @param date The date and time when the event occured.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (id: number, date: Date): Promise<void> => {
            return this.query.run('UPDATE events SET date=? WHERE id = ?', date, id);
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param id The id of the event.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (id: number): Promise<void> => {
            return this.query.run('DELETE FROM events WHERE id=?', id);
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
        index: (): Promise<Node[]> => {
            return this.query.all<Node>('SELECT * FROM nodes');
        },
        /**
         * Display the specified resource.
         *
         * @param host The host of the node.
         *
         * @throws {Error} When an exception occurs.
         */
        read: (host: string): Promise<Node> => {
            return this.query.get<Node>('SELECT * FROM nodes WHERE host=?', host);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param host The host of the node.
         * @param name The name of the node.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (host: string, name: string): Promise<void> => {
            return this.query.run('INSERT INTO nodes VALUES (?, ?)', host, name);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param host The host of the node.
         * @param name The name of the node.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (host: string, name: boolean): Promise<void> => {
            return this.query.run('UPDATE nodes SET name=? WHERE host=?', name, host);
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param host The host of the node.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (host: string): Promise<void> => {
            return this.query.run('DELETE FROM nodes WHERE host=?', host);
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
        index: (): Promise<State[]> => {
            return this.query.all<State>('SELECT * FROM states');
        },
        /**
         * Display the specified resource.
         *
         * @param address The address associated with the state.
         *
         * @throws {Error} When an exception occurs.
         */
        read: (address: string): Promise<State> => {
            return this.query.get<State>('SELECT * FROM states WHERE address=?', address);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param address The public key of the address.
         * @param balance The balance of the address.
         * @param date The date and time the address recieved a reward or joined.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (address: string, balance: number, date: Date): Promise<void> => {
            return this.query.run('INSERT INTO states VALUES (?, ?, ?)', address, balance, date);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param address The public key of the address.
         * @param balance The balance of the address.
         * @param date The date and time the address recieved a reward or joined.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (address: string, balance: string, date: Date): Promise<void> => {
            return this.query.run('UPDATE states SET balance=?, date=? WHERE address=?', balance, date, address);
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param address The address associated with the state.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (address: string): Promise<void> => {
            return this.query.run('DELETE FROM states WHERE address=?', address);
        },
    };

    /**
     * Class constructor.
     */
    constructor() {
        this.database = Container.get(Database);

        this.database.serialize(() => {
            // Create the tables.
            this.database.run(`
                CREATE TABLE IF NOT EXISTS addresses (
                    publicKey VARCHAR(32) PRIMARY KEY,
                    privateKey VARCHAR(32),
                    isDefault BOOLEAN
                )
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type VARCHAR(16),
                    data BLOB,
                    otherParent TEXT,
                    selfParent TEXT,
                    signature TEXT,
                    date DATETIME
                )
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS nodes (
                    host VARCHAR(32) PRIMARY KEY,
                    name VARCHAR(32)
                )
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS states (
                    address VARCHAR(32) PRIMARY KEY,
                    balance FLOAT,
                    date DATETIME
                )
            `);
        });
    }
}
