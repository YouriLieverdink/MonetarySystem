import { Request, Response } from 'express';
import { Service } from 'typedi';

@Service()
export class GossipService {
	/**
	 * Handle incoming requests.
	 * 
	 * @param request The received request.
	 * @param response The object used to send a response.
	 */
	public handle(request: Request, response: Response): void {
		//
	}
}