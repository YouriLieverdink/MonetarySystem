import express from 'express';
import ip from 'ip';
import { Database } from 'sqlite3';
import { Command, Internal } from './controllers/*';
import { Collection, Queue, Signal, Storage } from './services/*';
import { Computer, Transaction } from './types/*';
import { config } from './config';

const main = (): void => {
    // Initialise the express server for incoming connections.
    const server = express();
    server.use(express.json());
    server.listen(config.port, '0.0.0.0');

    // We provide a single seed to to bootstrap.
    const computers = new Collection<Computer>();
    computers.add({ ip: '10.5.0.5', port: 3001 });

    // We create ourselves to be discovered and start signaling.
    const me: Computer = { ip: ip.address(), port: config.port };
    new Signal(server, computers, me);

    // We setup these dependencies here so they can be shared.
    const database = new Database('db.sqlite3');
    const storage = new Storage(database);
    const pending = new Collection<Transaction>();

    new Command(pending, server, storage);
    new Internal(computers, server, pending, storage);
};

main();