import { Service } from 'typedi';

@Service()
export class CliService {
	/**
	 * Handle incoming requests.
	 * 
	 * @param request The received request.
	 * @param response The object used to send a response.
	 */
	public handle(request: string, response: unknown): void {
		//
	}
}