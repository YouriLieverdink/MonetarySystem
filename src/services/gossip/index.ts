import { Express, Request, Response } from 'express';
import Container from 'typedi';
import { HttpService, QueueService, StorageService } from '..';
import { Event } from '../../types';

export class GossipService {
	/**
	 * Stores incoming events which have to be processed.
	 */
	private eventsQueue: QueueService<Event>;

	/**
	 * The service used to send http requests.
	 */
	private httpService: HttpService;

	/**
	 * Used to store events which contain a consensus timestamp.
	 */
	private storageService: StorageService;

	/**
	 * Class constructor.
	 * 
	 * @param eventsQueue The events queue.
	 * @param httpService The http service.
	 */
	constructor(
		eventsQueue: QueueService<Event>,
		httpService?: HttpService,
	) {
		this.eventsQueue = eventsQueue;
		this.httpService = httpService || new HttpService();

		// Inject dependencies.
		this.storageService = Container.get<StorageService>('storage');

		this.initApi();
	}

	/**
	 * Initialise the api handling.
	 */
	private initApi(): void {
		const express = Container.get<Express>('express');
		express.get('/gossip/*', this.handle);
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