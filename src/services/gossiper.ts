import axios, { AxiosError } from 'axios';
import express from 'express';
import { Cluster } from '../types/cluster';
import { Gossip } from '../types/gossip';
import { State } from '../types/state';

export class Gossiper {
	/**
	 * The address on which this node listens.
	 */
	private address: string;

	/**
	 * A list of seed nodes.
	 */
	private seedNodes: string[];

	/**
	 * State information on every node in the cluster.
	 */
	private cluster: Cluster;

	/**
	 * The current state.
	 */
	public state: State

	/**
	 * Class constructor.
	 *
	 * @param address The address on which this node listens.
	 * @param seedNodes A list of seed nodes.
	 */
	constructor(address: string, seedNodes: string[]) {
		this.address = address;

		// Remove this node from the list of seed nodes if necessary.
		this.seedNodes = seedNodes.filter((addr) => addr !== this.address);

		// Set the initial cluster.
		this.cluster = {};
		this.cluster[address] = '✅';

		// Set the initial state.
		this.state = { 'messages': [] };

		this.initReceiver(address);
		this.initSender(1000);
		this.initLogger(50);
	}

	/**
	 * Initialise the listener.
	 *
	 * @param address The address on which this gossiper should listen.
	 */
	private initReceiver(address: string): void {
		// Create the app.
		const app = express();

		// Enable Json support.
		app.use(express.json());

		// Endpoint for incoming gossip.
		app.post('/gossip', (req, res) => {
			// Determine the gossip to send back.
			const gossip = this.handleHandshake(req.body);

			return res.json(gossip);
		});

		// Construct the port and ip from the address.
		const [ip, port] = address.split(':');

		// Start receiving.
		app.listen(+port, ip);
	}

	/**
	 * Initialise the sender.
	 *
	 * @param interval The interval at which to send gossip.
	 */
	private initSender(interval: number): void {
		// Set the interval.
		setInterval(this.doGossip.bind(this), interval);
	}

	/**
	 * Initialise the message logger.
	 *
	 * @param interval The interval at which to update the messages.
	 */
	private initLogger(interval: number): void {
		// Retrieve the current length of the messages.
		let length = this.state.messages.length;

		/**
		 * Log all the messages when it has been changed.
		 */
		const log = () => {
			// Retrieve the messages from state.
			const messages = this.state.messages;

			// Check whether any new message has been added.
			if (length !== messages.length) {
				// Clear the console and display all the messages.
				console.clear();

				messages.forEach(
					(m) => console.log(`${m.address} > ${m.content}`),
				);
			}

			// Update the length.
			length = messages.length;
		};

		setInterval(log, interval);
	};

	/**
	 * Start a gossiping session.
	 */
	private async doGossip(): Promise<void> {
		// Retrieve the possible nodes.
		const nodes = this.nodes();

		if (nodes.length > 0) {
			// Start a gossip with three different nodes.
			for (let i = 0; i < 1; i++) {
				// Pick a random node.
				const node = nodes[Math.floor(Math.random() * nodes.length)];

				// Start the gossip.
				await this.doHandshake(node);
			}
		} //
		else {
			// Check whether any seed nodes have been provided.
			if (this.seedNodes.length > 0) {
				// Pick a random node.
				const node = this.seedNodes[Math.floor(Math.random() * this.seedNodes.length)];

				// Start the gossip.
				await this.doHandshake(node, true);
			} //
		}
	};

	/**
	 * Start a handshake with another node.
	 *
	 * @param address The address of the node.
	 * @param isSeed Whether the address belongs to a seed node.
	 */
	private async doHandshake(address: string, isSeed: boolean = false): Promise<void> {
		try {
			// Create the gossip.
			const gossip: Gossip = {
				'cluster': this.cluster,
				'state': this.state,
			};

			// Attempt to perform a handshake.
			const response = await axios({
				'method': 'POST',
				'url': `http://${address}/gossip`,
				'data': gossip,
			});

			// Create a new gossip object from the return data.
			const newGossip: Gossip = response.data;

			// Walk through the addresses.
			Object.entries(newGossip.cluster).forEach(([addr, status]) => {
				// Update the outdated status.
				this.cluster[addr] = status;
			});

			// Create a new list of messages.
			const messages = [...this.state.messages, ...newGossip.state.messages];

			// Set the messgaes in a chronological order.
			this.state.messages = messages.sort((a, b) => {
				return new Date(a.date).getTime() - new Date(b.date).getTime();
			});
		} //
		catch (err) {

			const error: AxiosError = err;

			if (error.response) {
				// The server responded with an error.
				console.log(`(e) doHandshake: ${error.message}`);
			} //
			else if (error.request) {
				// The request could not be delivered.
				if (isSeed) {
					// The seed node was unreachable.
					console.log(`(e) doHandshake: Seed node at ${address} is unreachable.`);
				} //
				else {
					// Set the status to inactive.
					this.cluster[address] = '❌';
				}
			}
			else {
				// An unknown error occured.
				console.log(`(e) doHandshake: ${error.message}`);
			}
		}
	};

	/**
	 * Handle a incoming handshake.
	 *
	 * @param gossip The received gossip.
	 */
	private handleHandshake(gossip: Gossip): Gossip {
		// Clone the cluster of this node.
		const tempCluster = { ...this.cluster };

		// Loop through the received cluster.
		Object.entries(gossip.cluster).forEach(([addr, status]) => {
			// Check if we know this address.
			const isKnown = !!tempCluster[addr];

			if (isKnown) {
				// Compare the statuses.
				if (status !== this.cluster[addr]) {
					// Check if this is me.
					if (addr === this.address) {
						// Set both statuses to active.
						this.cluster[addr] = '✅';
						tempCluster[addr] = '✅';
					} //
					else {
						// Update the local status.
						this.cluster[addr] = status;
					}
				}
			} //
			else {
				// Add it to the local cluster.
				this.cluster[addr] = status;
			}

			// Remove the addr from the clone, since the peer already knows it.
			delete tempCluster[addr];
		});

		const tempState = { ...this.state };

		// Loop through the received messages.
		gossip.state.messages.forEach((mess) => {
			// Check if we know this message.
			const isKnown = !!tempState.messages.find((m) => {
				return new Date(m.date).getTime() === new Date(mess.date).getTime();
			});

			if (!isKnown) {
				// Add it to the local state.
				const messages = [...this.state.messages, mess];
				this.state.messages = messages.sort((a, b) => {
					return new Date(a.date).getTime() - new Date(b.date).getTime();
				});
			}

			// Remove the message from the clone, since the peer already knows it.
			tempState.messages = tempState.messages.filter((m) => {
				return new Date(m.date).getTime() !== new Date(mess.date).getTime();
			});
		});

		return { 'cluster': tempCluster, 'state': tempState };
	};

	/**
	 * Returns a list of all the active (known) nodes.
	 */
	private nodes(): string[] {
		return Object
			.entries(this.cluster)
			.filter((node) => {
				// Also exclude 'this' node.
				return node[1] === '✅' && node[0] !== this.address;
			})
			.map((node) => node[0]);
	};

	/**
	 * Adds a new message to the local state.
	 *
	 * @param content Content of the message.
	 */
	public addMessage(content: string): void {
		// Push the message.
		this.state.messages.push({
			'date': new Date(),
			'content': content,
			'address': this.address,
		});
	}
};

/**
 * Create a new Gossiper.
 *
 * @param address The address on which this node listens.
 * @param nodes A list of seed nodes.
 */
export function useGossiper(address: string, nodes: string[]) {
	return new Gossiper(address, nodes);
};