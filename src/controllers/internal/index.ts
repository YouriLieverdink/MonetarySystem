import Container from 'typedi';
import { ConsensusService, GossipService, Queue, StorageService } from '../../services';
import { Event, Transaction } from '../../types';

export class InternalController {
	/**
	 * Reaches consensus on a set of events.
	 */
	private consensusService: ConsensusService;

	/**
	 * Stores incoming events which have to be processed.
	 */
	private eventsQueue: Queue<Event>;

	/**
	 * Populates the events queue with events from the network.
	 */
	private gossipService: GossipService;

	/**
	 * Used to store events which contain a consensus timestamp.
	 */
	private storageService: StorageService;

	/**
	 * Incoming transactions from the operating user.
	 */
	private transactionsQueue: Queue<Transaction>;

	/**
	 * Class constructor.
	 *
	 * @param consensusService The consensus service.
	 * @param eventsQueue The events queue.
	 * @param gossipService The gossip service.
	 */
	constructor(
		consensusService?: ConsensusService,
		eventsQueue?: Queue<Event>,
		gossipService?: GossipService
	) {
		this.consensusService = consensusService || new ConsensusService();
		this.eventsQueue = eventsQueue || new Queue<Event>();
		this.gossipService = gossipService || new GossipService(this.eventsQueue);

		// Inject dependencies.
		this.storageService = Container.get<StorageService>('storage');
		this.transactionsQueue = Container.get<Queue<Transaction>>('transactions');

		setInterval(this.tick.bind(this), 500);
	}

	/**
	 * Tick tok.
	 */
	private tick(): void {
		//
	}
}