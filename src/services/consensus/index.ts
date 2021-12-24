import Container from 'typedi';
import { StorageService } from '..';

export class ConsensusService {
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
	 * Initiate a new Consensus calculation.
	 */
	public doConsensus(): void {
		//
		throw Error('Not implemented');
	}
}