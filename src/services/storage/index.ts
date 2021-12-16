import { Database } from 'sqlite3';
import { Service } from 'typedi';
import { Address } from '../../types/address';

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
         * @returns A promise.
         */
        run: (sql: string) => {
            return new Promise((resolve, reject) => {
                this.database.run(sql, (err) => {
                    if (err) reject(err);

                    resolve(true);
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
        get: (sql: string, ...params: unknown[]) => {
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
        all: (sql: string, ...params: unknown[]) => {
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

            throw Error('Not implemented');
        },
        /**
         * Display the specified resource.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        read: (publicKey: string): Address => {

            throw Error('Not implemented');
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

            throw Error('Not implemented');
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

            throw Error('Not implemented');
        },
        /**
         * Remove the specified resource from storage.
         *
         * @param publicKey The public key of the address.
         *
         * @throws {Error} When an exception occurs.
         */
        destroy: (publicKey: string): void => {

            throw Error('Not implemented');
        },
    };

    /**
     * The events methods.
     */
    public readonly events = {};

    /**
     * The node methods.
     */
    public readonly nodes = {};

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
}
