import { Express } from 'express';
import { Api, Collection, Storage } from "../services/*";
import { Transaction } from '../types/*';

/**
 * Responsible for handling the operations requested by the user via the api
 * service.
 */
export class Command {
    /**
     * Class constructor.
     * 
     * @param pending The collection for pending transactions.
     * @param server The active express server.
     * @param storage The interface for the database.
     */
    constructor(
        private pending: Collection<Transaction>,
        private server: Express,
        private storage: Storage,
    ) {
        //
        const api = new Api(this);
        this.server.get('/api/*', api.handle);
    }
}