import 'reflect-metadata';
import { Database } from 'sqlite3';
import Container from 'typedi';
import env from './config/env';
import { InternalController } from './controllers/internal';

const main = (): void => {
	// Setup dependencies.
	Container.set(Database, new Database('db.sqlite3'));

	// Start.
	new InternalController({
		'interval': 500,
		'port': 3001,
		'seed': `${env.seed.ip}:${env.seed.port}`,
	});
};

main();