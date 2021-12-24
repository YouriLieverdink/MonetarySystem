import { Express, Request, Response } from 'express';
import { Inject } from 'typedi';
import { QueueService, StorageService } from '..';
import { Event } from '../../types';

export class GossipService {
	/**
	 * Stores incoming events which have to be processed.
	 */
	private eventsQueue: QueueService<Event>;

	/**
	 * The express application used to handle api requests.
	 */
	@Inject('express')
	private express: Express;

	/**
	 * Used to store events which contain a consensus timestamp.
	 */
	@Inject('storage')
	private storageService: StorageService;

	/**
	 * Class constructor.
	 * 
	 * @param eventsQueue The events queue.
	 */
	constructor(
		eventsQueue: QueueService<Event>,
	) {
		this.eventsQueue = eventsQueue;

		this.initApi();
	}

	/**
	 * Initialise the api handling.
	 */
	private initApi(): void {
		this.express.get('/gossip/*', this.handle);
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
}