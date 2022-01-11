import { Request, Response } from 'express';
import { CommandController } from '../controllers';

export class Api {
    /**
     * The instance which should receive all commands.
     */
    private command: CommandController;

    /**
     * Class constructor.
     */
    constructor(
        command: CommandController,
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