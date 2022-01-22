import express from 'express';
import { Command } from './controllers/command';

const main = () => {
    //
    const server = express();
    server.listen(3001);

    new Command(server);
};

main();