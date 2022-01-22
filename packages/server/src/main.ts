import express from 'express';
import { Database } from 'sqlite3';
import { Command } from './controllers/command';
import { Internal } from './controllers/internal';
import { Queue } from './services/queue';
import { Storage } from './services/storage';
import { Transaction } from './types/transaction';

const main = () => {
    //
    const queue = new Queue<Transaction>();

    const database = new Database('db.sqlite3');
    const storage = new Storage(database);

    const server = express();
    server.listen(3001);

    new Internal(queue, storage, server);
    new Command(server);
};

main();