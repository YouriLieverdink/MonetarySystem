import express from 'express';
import ip from 'ip';
import { Database } from 'sqlite3';
import { config } from './config';
import { Blab, Command, Signal } from './controllers/_';
import { Collection, Storage } from './services/_';
import { Computer, Transaction } from './types/_';

const main = (): void => {
    // Initialise the express server for incoming connections.
    const server = express();
    server.use(express.json({limit: '5mb'}));
    server.use(express.urlencoded({limit: '5mb'}));
    server.listen(config.port, '0.0.0.0', () =>
        {console.log( `server started at http://localhost:${ config.port }`);}
        );


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