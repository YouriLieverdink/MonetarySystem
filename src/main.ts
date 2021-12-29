import express from 'express';
import 'reflect-metadata';
import { Database } from 'sqlite3';
import Container from 'typedi';
import { CommandController, InternalController } from './controllers';
import { QueueService, StorageService } from './services';
import { Transaction } from './types';

const main = (): void => {
	// Initalise dependencies.
	const app = express();
	app.listen(3001, '0.0.0.0');
	Container.set('express', app);

	const database = new Database('db.sqlite3');
	Container.set('storage', new StorageService(database));

	Container.set('transactions', new QueueService<Transaction>());

	// Kickstart the node.
	new CommandController();
	new InternalController();
};

main();