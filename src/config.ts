import dotenv from 'dotenv';

// Initialise config.
dotenv.config();

const config = {
	// Information on DNS node.
	'dns': {
		'host': process.env.ROOT_HOST,
		'port': process.env.PORT,
	},
	// Information on this node.
	'node': {
		'isRoot': process.env.IS_ROOT,
	},
	// Information for express.
	'express': {
		'host': '127.0.0.1',
		'port': process.env.LOCAL_PORT,
	},
}

if (process.env.ENV === 'production') {
	// Update host when in production.
	config.express.host = '0.0.0.0';
}

export default config