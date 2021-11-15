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
		this.cluster = {};

		// Remove this node from the list of seed nodes if necessary.
		this.seedNodes = seedNodes.filter((addr) => addr !== this.address);

		// Set the state for this node.
		this.cluster[address] = {
			'version': 0,
			'messages': [],
		}

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

		console.log()
		console.log(JSON.stringify(this.cluster, null, 4));

		// Exit when the cluster is empty.
		if (!this.cluster) return;

		// Retrieve the nodes exluding this.
		const nodes = Object.entries(this.cluster).filter(
			([addr, _]) => addr !== this.address,
		);

		if (nodes.length > 0) {
			// Start a gossip with three different nodes.
			for (let i = 0; i < 3; i++) {
				// Pick a random node.
				const node = nodes[Math.floor(Math.random() * nodes.length)];

				// Start the gossip.
				await this.doHandshake(node[0]);
			}
		} //
		else {
			// Check whether any seed nodes have been provided.
			if (this.seedNodes.length > 0) {
				// Pick a random node.
				const node = this.seedNodes[Math.floor(Math.random() * this.seedNodes.length)];

				// Start the gossip.
				await this.doHandshake(node);
			} //
		}
	};

	/**
	 * Start a handshake with another node.
	 *
	 * @param address The address of the node.
	 */
	private async doHandshake(address: string): Promise<void> {
		try {
			// Attempt to perform a handshake.
			const response = await axios({
				'method': 'POST',
				'url': `http://${address}/gossip`,
				'data': this.cluster,
			});

			// Create a cluster from the return data.
			const cluster: Cluster = response.data;

			Object.entries(cluster).forEach(([addr, state]) => {
				// Update the outdated states.
				this.cluster[addr] = state;
			});

		} //
		catch (err) {

			const error: AxiosError = err;

			if (error.response) {
				// The server responded with an error.
				console.log(`(e) doHandshake: ${error.message}`);
			} //
			else if (error.request) {
				// The request could not be delivered, remove the node.
				delete this.cluster[address];

				console.log(`(e) doHandshake: ${error.message}`);
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
		// Create a temporary cluster.
		const tempCluster: Cluster = {};

		Object.entries(cluster).forEach(([addr, state]) => {
			// Retrieve the local state.
			const localState = this.cluster[addr];

			// Set when it was not present.
			if (!localState) {
				this.cluster[addr] = state;

				return;
			}

			// Update when the local version is older.
			if (localState.version < state.version) {
				this.cluster[addr] = state;

				return;
			}

			// Add to tempCluster when local version is newer.
			if (localState.version > state.version) {
				tempCluster[addr] = localState;

				return;
			}
		});

		return tempCluster;
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