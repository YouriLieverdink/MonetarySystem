import { Database } from 'sqlite3';
import { Address, Computer, Event, Setting, State, Transaction } from '../../types';

export class StorageService {
    /**
     * The database.
     */
    private database: Database;

    /**
     * Class constructor.
     * 
     * @param database The database.
     */
    constructor(
        database: Database,
    ) {
        this.database = database;

        this.database.serialize(() => {
            // Create the tables.
            this.database.run(`
                CREATE TABLE IF NOT EXISTS addresses (
                    publicKey VARCHAR(64) PRIMARY KEY,
                    privateKey VARCHAR(64),
                    isDefault BOOLEAN NOT NULL DEFAULT 0
                )
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS events (
                    id VARCHAR(64),
                    timestamp DATETIME,
                    publicKey VARCHAR(64),
                    signature VARCHAR(64),
                    selfParent VARCHAR(64),
                    otherParent VARCHAR(64),
                    data VARCHAR(255)
                )
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS computers (
                    ip VARCHAR(32) PRIMARY KEY,
                    port INT,
                    name VARCHAR(32)
                )
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS states (
                    publicKey VARCHAR(64) PRIMARY KEY,
                    balance FLOAT,
                    date DATETIME
                )
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS settings (
                    key VARCHAR(16) PRIMARY KEY,
                    value VARCHAR(16) NOT NULL
                )
            `);
        });
    }

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
        }
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
        create: (publicKey: string, privateKey: string, isDefault: 0 | 1): Promise<void> => {
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
        update: (publicKey: string, isDefault: 0 | 1): Promise<void> => {
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
        }
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
        index: <T>(): Promise<Event<T>[]> => {
            return this.query.all<Event<T>>('SELECT * FROM events');
        },
        /**
         * Display the specified resource.
         *
         * @param id The id of the event.
         *
         * @throws {Error} When an exception occurs.
         */
        read: <T>(id: number): Promise<Event<T>> => {
            return this.query.get<Event<T>>('SELECT * FROM events WHERE id=?', id);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param date The date and time when the event occured.
         *
         * @throws {Error} When an exception occurs.
         */
        create: <T>(event: Event<T>): Promise<void> => {
            const data = JSON.stringify(event.data);
            return this.query.run('INSERT INTO events VALUES (?, ?, ?, ?, ?, ?)', event.id, event.timestamp, event.publicKey, event.signature, event.selfParent, event.otherParent, data);
        },
        /**
         * Update the specified resource in storage.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (): Promise<void> => {
            //
            throw Error('Not implemented');
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
        }
    };

    /**
     * The computers methods.
     */
    public readonly computers = {
        /**
         * Display a listing of the resource.
         *
         * @throws {Error} When an exception occurs.
         */
        index: (): Promise<Computer[]> => {
            return this.query.all<Computer>('SELECT * FROM computers');
        },
        /**
         * Display the specified resource.
         *
         * @param ip The ip of the computer.
         * @param port The port of the computer.
         *
         * @throws {Error} When an exception occurs.
         */
        read: (ip: string, port: number): Promise<Computer> => {
            return this.query.get<Computer>('SELECT * FROM computers WHERE ip=? AND port=?', ip, port);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param computer The computer to store.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (computer: Computer): Promise<void> => {
            return this.query.run('INSERT INTO computers VALUES (?, ?, ?)', computer.ip, computer.port, computer.name);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param computer The computer to update.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (computer: Computer): Promise<void> => {
            return this.query.run('UPDATE nodes SET name=? WHERE host=? AND port=?', computer.name, computer.ip, computer.port);
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
        }
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
         * @param publicKey The public key associated with the state.
         *
         * @throws {Error} When an exception occurs.
         */
        read: (publicKey: string): Promise<State> => {
            return this.query.get<State>('SELECT * FROM states WHERE publicKey=?', publicKey);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param state The state to store.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (state: State): Promise<void> => {
            return this.query.run('INSERT INTO states VALUES (?, ?, ?)', state.publicKey, state.balance, state.date);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param state The state to update.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (state: State): Promise<void> => {
            return this.query.run('UPDATE states SET balance=?, date=? WHERE publicKey=?', state.balance, state.date, state.publicKey);
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param publicKey The publicKey associated with the state.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (publicKey: string): Promise<void> => {
            return this.query.run('DELETE FROM states WHERE publicKey=?', publicKey);
        }
    };

    /**
     * The transactions methods.
     */
    public readonly transactions = {
        /**
         * Display a listing of the resource.
         *
         * @param publicKey The public key of the address.
         * 
         * @throws {Error} When an exception occurs.
         */
        index: async (publicKey: string): Promise<Transaction[]> => {
            const events = await this.query.all<Event<Transaction>>('SELECT * FROM events WHERE data LIKE ?', `%"from":"${publicKey}"%`);
            events.forEach((event) => event.data = JSON.parse(String(event.data)));
            return events.map((event) => event.data as Transaction);
        }
    };

    /**
     * The settings methods.
     */
    public readonly settings = {
        /**
         * Display the specified resource.
         *
         * @param key The key of the setting to retrieve.
         *
         * @throws {Error} When an exception occurs.
         */
        get: (key: string): Promise<Setting> => {
            return this.query.get<Setting>('SELECT * FROM settings WHERE key=?', key);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param setting The setting to store.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (setting: Setting): Promise<void> => {
            return this.query.run('INSERT INTO settings VALUES (?, ?)', setting.key, setting.value);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param setting The setting to update.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (setting: Setting): Promise<void> => {
            return this.query.run('UPDATE settings SET value=? WHERE key=?', setting.value, setting.key);
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param key The key associated with the setting.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (key: string): Promise<void> => {
            return this.query.run('DELETE FROM settings WHERE key=?', key);
        }
    };
}
