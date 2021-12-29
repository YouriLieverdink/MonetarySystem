import dotenv from 'dotenv';

// Load the contents of the .env file.
dotenv.config();

const env = {
	// Address of the seed node.
	seed: {
		ip: process.env.SEED_IP || '0.0.0.0',
		port: process.env.SEED_PORT || 3001,
	},
	// Address of this node.
	node: {
		port: process.env.PORT || 3001,
	},
	// Database configuration.
	database: {
		path: process.env.DATABASE_PATH || 'db.sqlite3',
	},
	// Interval configuration.
	interval: process.env.INTERVAL || 500,
};

export default env;