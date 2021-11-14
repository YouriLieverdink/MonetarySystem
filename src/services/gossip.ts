import axios from 'axios';
import publicIp from 'public-ip';
import config from '../config';
import { Message } from '../types/message';
import { Peer } from '../types/peer';

/**
 * Implementation of Gossip protocol.
 */
class GossipService {
	/**
	 * The known peers.
	 */
	public peers: Peer[];

	/**
	 * Class constructor.
	 */
	constructor() {
		this.peers = [];

		// When this is not the dns peer, add it.
		if (!config.peer.isDns) {

			this.peers.push({
				'name': 'dns',
				'host': `${config.dns.host}:${config.port}`,
			});
		}
	}

	/**
	 * Dispatch a state message to a random peer.
	 *
	 * @return Whether it was successfull.
	 */
	public async dispatch(): Promise<boolean> {
		// Check whether there are any peers.
		if (!this.peers || this.peers.length === 0) return;

		// Retrieve a random peer.
		const peer = this.peers[Math.floor(Math.random() * this.peers.length)];

		// Create the message.
		const message: Message = {
			'from': await this.me(),
			'data': this.peers,
		};

		try {
			// Send all know peers.
			await axios.post(`http://${peer.host}/state`, message);

			return true;
		} //
		catch (err) {
			// An error occured.
			console.error(`Dispatch error: ${err}`);

			return false;
		}
	};

	/**
	 * Handle a received state update.
	 *
	 * @param message The received message.
	 */
	public async handle(message: Message): Promise<void> {
		// Retrieve this node.
		const me = await this.me();

		// Construct the list of peers.
		const peers = [message.from, ...message.data as Peer[]];

		peers.forEach(
			(peer) => {
				// Check whether we are the peer.
				if (peer.host === me.host) {
					return;
				}

				// Check if we already know the peer.
				const filtered = this.peers.filter(
					(p) => p.host === peer.host
				);

				if (filtered.length >= 1) {
					return;
				}

				// Add the peer.
				this.peers.push(peer);
			}
		);
	};

	/**
	 * Construct a `Peer` for this node.
	 *
	 * @returns The peer.
	 */
	 public async me(): Promise<Peer> {
		// Retrieve the public ip.
		const ip = await publicIp.v4();

		return {
			'name': config.peer.name,
			'host': `${ip}:${config.port}`,
		};
	};
}

/**
 * Create a new Gossip instance.
 */
export const useGossip = (): GossipService => new GossipService();