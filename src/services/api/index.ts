import { Request, Response } from 'express';
import { CommandController } from '../../controllers';

export class ApiService {
	/**
	 * The instance which should receive all commands.
	 */
	private commandController: CommandController;

	/**
	 * Class constructor.
	 */
	constructor(
		commandController: CommandController,
	) {
		this.commandController = commandController;
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