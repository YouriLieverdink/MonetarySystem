import 'reflect-metadata';
import Container from 'typedi';
import { main } from './main';
import { server } from './server';

Container.set('databasePath', 'db.sqlite3');

main();
server();