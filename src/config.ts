import dotenv from 'dotenv';

dotenv.config();

export const env = {
	seed: {
		ip: process.env.SEED_IP,
		port: process.env.SEED_PORT
	},
	node: {
		ip: process.env.IP,
		port: process.env.PORT
	},
	interval: process.env.INTERVAL,
	debug: process.env.DEBUG === 'true'
};