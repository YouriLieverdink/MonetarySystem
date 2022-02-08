import { Database } from 'sqlite3';
import { Address, Setting, Transaction } from '../types/_';

export class Storage {
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
                    privateKey VARCHAR(64)
                )
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id VARCHAR(64) PRIMARY KEY,
                    timestamp INT,
                    \`index\` INT,
                    receiver VARCHAR(64),
                    sender VARCHAR(64),
                    amount INT
                )
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS settings (
                    key VARCHAR(16) PRIMARY KEY,
                    value VARCHAR(16) NOT NULL
                )
            `);
        });

        // Initialise the default settings.
        this.settings.create({ key: 'default', value: '' }).catch(() => { });
    }

    /**
     * The query methods.
     */
    public readonly query = {
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
         * @param address The address object.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (address: Address): Promise<void> => {
            return this.query.run('INSERT INTO addresses VALUES (?, ?)', address.publicKey, address.privateKey);
        },
        /**
         * Update the specified resource in storage.
         *
         * @param address The address object.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (address: Address): Promise<void> => {
            //
            throw Error('Not implemented');
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
     * The transactions methods.
     */
    public readonly transactions = {
        /**
          * Display a listing of the resource.
          *
          * @param publicKey The receiver and or sender to filter for.
          * @param limit The maximum number of transactions to return.
          * @param offset Starts at `offset` + 1.
          * 
          * @throws {Error} When an exception occurs.
          */
        index: (publicKey?: string, limit?: number, offset?: number): Promise<Transaction[]> => {
            //
            let query = 'SELECT * FROM transactions';
            let params: string[] = [];

            if (publicKey) {
                query += ' WHERE sender=? OR receiver=?';
                params.push(...[publicKey, publicKey]);
            }

            // Ensure the latest transactions are shown as first.
            query += ' ORDER BY `index` DESC';

            if (limit) {
                query += ' LIMIT ?';
                params.push(`${limit}`);
            }

            if (limit && offset) {
                query += ' OFFSET ?';
                params.push(`${offset}`);
            }

            return this.query.all(query, ...params);
        },
        /**
         * Store a newly created resource in storage.
         *
         * @param transaction The transaction object.
         *
         * @throws {Error} When an exception occurs.
         */
        create: (transaction: Transaction): Promise<void> => {
            //
            return this.query.run(
                'INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?)',
                transaction.id, transaction.timestamp, transaction.index, transaction.receiver, transaction.sender, transaction.amount,
            );
        },
        /**
         * Update the specified resource in storage.
         *
         * @param transaction The transaction object.
         *
         * @throws {Error} When an exception occurs.
         */
        update: (transaction: Transaction): Promise<void> => {
            //
            throw Error('Not implemented');
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param id The id of the transaction.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (id: string): Promise<void> => {
            return this.query.run('DELETE FROM transactions WHERE id=?', id);
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
