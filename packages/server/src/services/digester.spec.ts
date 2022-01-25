import {Digester} from './digester';
import {cEvent, Consensus} from "./consensus";
import {Storage} from "./storage";
import {Database} from 'sqlite3';

describe('Digester', () => {
    let storage: Storage;
    let database: Database;
    let digester: Digester<never>;
    let events: cEvent<never>[];

    beforeAll(() => {
        //create test events
        events = [];
        for (let i = 0; i < 5; i++) {
            events.push({id: `${i}`, createdAt: new Date(), publicKey: '', signature: ''});
        }

        // Initialise a new in-memory database for every test.
        database = new Database(':memory:');
        storage = new Storage(database);
        digester = new Digester<never>(storage);
    });

    describe('digest', () => {

        describe('update state', () => {
            it('validates an transaction', () => {
                //TODO
            });

            it('updates states in database', () => {
                //TODO
            });
        })

        describe('mirror', () => {
            it('checks if the mirror setting is activated', async () => {
                const setting = {key: 'mirror', value: 'true'}
                await storage.settings.update(setting)

                expect(digester.mirrorIsActive()).toBeTruthy();
            });

            it('puts events in database if mirroring is activated', async () => {
                //TODO
            });
        })

    });
});