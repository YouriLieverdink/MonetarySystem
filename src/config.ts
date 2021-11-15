import dotenv from 'dotenv';

// Initialise config.
dotenv.config();

const config = {
	// Address of the seed node.
	'seed': {
		'ip': process.env.SEED_IP || '0.0.0.0',
		'port': process.env.SEED_PORT || 3001,
	},
	// Address of this node.
	'node': {
		'ip': process.env.IP,
		'port': process.env.PORT || 3001,
	},
}

export default config