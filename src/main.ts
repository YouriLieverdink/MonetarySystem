import publicIp from 'public-ip';
import readline from 'readline';
import config from './config';
import { Gossiper, useGossiper } from './services/gossiper';

// The reader interface.
const rl = readline.createInterface({
	'input': process.stdin,
	'output': process.stdout,
});

/**
 * Asks the user for input.
 */
const ask = (gossiper: Gossiper) => {
	// Ask the user for input, then add it to the gossiper.
	rl.question('', message => {
		gossiper.addMessage(message);
		ask(gossiper);
	});
};

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
	const gossiper = useGossiper(address, nodes);

	ask(gossiper);
};

main();