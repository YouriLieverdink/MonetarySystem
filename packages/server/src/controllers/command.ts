import { Express } from 'express';
import { Api } from "../services/*";

/**
 * Responsible for handling the operations requested by the user via the api
 * service.
 */
export class Command {
    /**
     * Class constructor.
     * 
     * @param server The active express server.
     */
    constructor(
        server: Express,
    ) {
        //
        const api = new Api(this);
        server.get('/api/*', api.handle);
    }
}