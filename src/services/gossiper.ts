import axios, { AxiosError } from 'axios';
import express from 'express';
import config from '../config';
import { Cluster } from '../types/cluster';

class Gossiper {
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
	 * Class constructor.
	 *
	 * @param address The address on which this node listens.
	 * @param seedNodes A list of seed nodes.
	 */
	constructor(address: string, seedNodes: string[]) {
		this.address = address;

		// Set the initial cluster.
		this.cluster = {};
		this.cluster[address] = '✅';

		// Remove this node from the list of seed nodes if necessary.
		this.seedNodes = seedNodes.filter((addr) => addr !== this.address);

		this.init();
	}

	/**
	 * Initialise this gossiper.
	 */
	private init(): void {
		// Create the application.
		const app = express();

		app.use(express.json());

		// Handle incoming gossip.
		app.post('/gossip', (req, res) => {
			// Handle the incoming gossip.
			const cluster = this.handleHandshake(req.body);

			// Return the newly updated state information.
			res.status(200).json(cluster);
		});

		app.listen(+config.node.port, `${config.node.ip}`, null, () => {
			// Indicate the node has started.
			console.info(`(i) Listening at '${this.address}'.`);
		});

		setInterval(this.doGossip.bind(this), 1000);
	};

	/**
	 * Start a gossiping session.
	 */
	private async doGossip(): Promise<void> {
		// Display the current cluster.
		console.clear();
		console.log();
		console.log(JSON.stringify(this.cluster, null, 4));

		// Retrieve the possible nodes.
		const nodes = this.nodes();

		if (nodes.length > 0) {
			// Start a gossip with three different nodes.
			for (let i = 0; i < 3; i++) {
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
			// Attempt to perform a handshake.
			const response = await axios({
				'method': 'POST',
				'url': `http://${address}/gossip`,
				'data': this.cluster,
			});

			// Create a cluster from the return data.
			const cluster: Cluster = response.data;

			Object.entries(cluster).forEach(([addr, status]) => {
				// Update the outdated states.
				this.cluster[addr] = status;
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

					console.log(`(i) doHandshake: Node at ${address} has been set to inactive.`);
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
	 * @param cluster The received cluster.
	 */
	private handleHandshake(cluster: Cluster): Cluster {
		// Clone the cluster of this node.
		const tempCluster = { ...this.cluster };

		// Loop through the received cluster.
		Object.entries(cluster).forEach(([addr, status]) => {
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

		return tempCluster;
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