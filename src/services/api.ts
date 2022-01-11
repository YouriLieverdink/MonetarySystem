import { Request, Response } from 'express';
import { Command } from '../controllers';

export class Api {
    /**
     * The instance which should receive all commands.
     */
    private command: Command;

    /**
     * Class constructor.
     */
    constructor(
        command: Command,
    ) {
        this.command = command;
    }

    /**
     * Handle incoming requests.
     * 
     * @param request The received request.
     * @param response The object used to send a response.
     */
    public async handle(request: Request, response: Response): Promise<void> {
        //
    }
}