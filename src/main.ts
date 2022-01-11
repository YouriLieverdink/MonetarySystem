import express from 'express';
import 'reflect-metadata';
import { Database } from 'sqlite3';
import Container from 'typedi';
import { env } from './config';
import { Command, Internal } from './controllers';
import { Queue, Storage } from './services';
import { Transaction } from './types';

const main = (): void => {
	// Initialise the dependencies.
	const app = express();
	app.use(express.json());

	app.listen(3001, '0.0.0.0');
	Container.set('express', app);

	const database = new Database('db.sqlite3');
	Container.set('storage', new Storage(database));

	Container.set('transactions', new Queue<Transaction>());

	new Internal({
		interval: +env.interval,
		me: { ip: env.node.ip, port: +env.node.port },
		// Set the available seed computers.
		computers: [
			{ ip: env.seed.ip, port: +env.seed.port }
		]
	});

	if (!env.debug) {
		new Command();
	}
};

main();