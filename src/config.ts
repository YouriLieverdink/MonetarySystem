import dotenv from 'dotenv';

// Initialise config.
dotenv.config();

const config = {
	// Information on root peer.
	'dns': {
		'host': process.env.DNS_HOST || '0.0.0.0',
	},
	// Information on this peer.
	'peer': {
		'name': process.env.NAME || 'Cow',
		'isDns': process.env.IS_DNS === 'true',
	},
	// Default port.
	'port': process.env.PORT || 3001,
}

export default config