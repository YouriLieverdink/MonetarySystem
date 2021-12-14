import Container, { Service } from 'typedi';
import { Request, Response } from 'express';
import { StorageService } from '..';

@Service()
export class GossipService {
	/**
	 * The storage service.
	 */
	private storage: StorageService;

	/**
	 * Class constructor.
	 */
	constructor() {
		this.storage = Container.get(StorageService);
	}

	/**
	 * Handle incoming requests.
	 * 
	 * @param request The received request.
	 * @param response The object used to send a response.
	 */
	public handle(request: Request, response: Response): void {
		//
		throw Error('Not implemented');
	}

	/**
	 * Initiate a new Gossip sync with another node.
	 */
	public doGossip(): void {
		//
		throw Error('Not implemented');
	}
}