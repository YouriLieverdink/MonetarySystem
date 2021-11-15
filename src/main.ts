import publicIp from 'public-ip';
import config from './config';
import { useGossiper } from './services/gossiper';

/**
 * Kickstart the node.
 */
const main = async () => {
	// Construct this nodes' address.
	const ip = config.node.ip || await publicIp.v4();
	const address = `${ip}:${config.node.port}`;

	// Construct the seed nodes.
	const nodes: string[] = [
		`${config.seed.ip}:${config.seed.port}`,
	];

	// Create and run the gossiper.
	useGossiper(address, nodes);
};

main();