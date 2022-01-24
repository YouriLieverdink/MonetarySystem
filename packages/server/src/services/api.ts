import { Request, Response } from 'express';
import { Command } from '../controllers/_';

/**
 * Responsible for parsing incoming Http requests and directing them to the
 * correct method in the Command controller.
 */
export class Api {
    /**
     * Class constructor.
     * 
     * @param command The controller which handles the user input.
     */
    constructor(
        private command: Command,
    ) { }

    /**
     * Handle incoming requests.
     * 
     * @param request The received request.
     * @param response The object used to send a response.
     */
    public async handle(request: Request, response: Response): Promise<void> {
        //
        response.status(200).send('pong');
    }
}