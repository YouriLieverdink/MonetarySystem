import express from 'express';
import ip from 'ip';
import { Database } from 'sqlite3';
import { config } from './config';
import { Blab, Command, Signal } from './controllers/*';
import { Collection, Storage } from './services/*';
import { Computer, Transaction } from './types/*';

const main = (): void => {
    // Initialise the express server for incoming connections.
    const server = express();
    server.use(express.json());
    server.listen(config.port, '0.0.0.0');

    // We provide a single seed to to bootstrap.
    const computers = new Collection<Computer>();
    computers.add({ ip: '10.5.0.5', port: 3001 });
    computers.add({ ip: '192.168.178.95', port: 3001 });
    computers.add({ ip: ip.address(), port: config.port });

    // We setup these dependencies here so they can be shared.
    const database = new Database('db.sqlite3');
    const storage = new Storage(database);
    const pending = new Collection<Transaction>();

    new Command(pending, server, storage);

    new Signal(server, computers, 500);
    new Blab(server, computers, 500, pending, storage);
};

main();