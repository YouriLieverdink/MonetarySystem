import 'reflect-metadata';
import { cli } from './cli';
import { Database } from 'sqlite3';
import Container from 'typedi';
import { main } from './main';
import { server } from './server';

// Set the database.
Container.set(Database, new Database('db.sqlite3'));

cli();
main();
server();