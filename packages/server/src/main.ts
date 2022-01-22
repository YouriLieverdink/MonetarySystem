import express from 'express';
import ip from 'ip';
import { Collection } from './services/collection';
import { Signal } from './services/signal';
import { Computer } from './types/computer';

const main = (): void => {
    //
    const server = express();
    server.use(express.json());
    server.listen(3001, '0.0.0.0');

    const computers = new Collection<Computer>();
    computers.add({ ip: '10.5.0.5', port: 3001 });

    const me: Computer = { ip: ip.address(), port: 3001 };

    new Signal(server, computers, me);
};

main();