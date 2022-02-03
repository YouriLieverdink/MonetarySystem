// import { Digester } from './digester';
// import { _Event } from "./consensus";
// import { Storage } from "./storage";
// import { Database } from 'sqlite3';
// import { Transaction } from "../types/transaction";
//
// describe('Digester', () => {
//     let storage: Storage;
//     let database: Database;
//     let digester: Digester<never>;
//     let events: _Event<Transaction[]>[];
//
//     beforeAll(async () => {
//         // Initialise a new in-memory database for every test.
//         database = new Database(':memory:');
//         storage = new Storage(database);
//         digester = new Digester<never>(storage);
//
//         //create test events
//         events = [];
//         const publicKeys = ['piet', 'henk', 'klaas', 'jan', 'geert', 'hacker'];
//         const transactions = [
//             { from: 'piet', to: 'henk', amount: 101 },
//             { from: 'henk', to: 'klaas', amount: 34 },
//             { from: 'klaas', to: 'jan', amount: 59 },
//             { from: 'jan', to: 'geert', amount: 32 },
//             { from: 'geert', to: 'piet', amount: 18 },
//             { from: 'piet', to: 'hacker', amount: 18 }
//         ]
//
//         for (let i = 0; i < 6; i++) {
//             events.push({
//                 id: `${i}`,
//                 createdAt: 1,
//                 publicKey: publicKeys[i],
//                 signature: '',
//                 data: [transactions[i]]
//             });
//             await storage.states.create({ publicKey: publicKeys[i], balance: 100, date: new Date() })
//         }
//         events[2].data[1] = { from: 'klaas', to: 'jan', amount: 21 }
//
//     });
//
//     describe('handles transactions', () => {
//
//         beforeEach(async () => {
//             const publicKeys = ['piet', 'henk', 'klaas', 'jan', 'geert'];
//             for (let i = 0; i < publicKeys.length; i++) {
//                 await storage.states.update({ publicKey: publicKeys[i], balance: 100, date: new Date() })
//             }
//         });
//
//         it('does not execute transaction if not enough coins', async () => {
//             await digester.handleTransactions(events[0].data, events[0].publicKey)
//
//             const from = await storage.states.read(events[0].data[0].from)
//             const to = await storage.states.read(events[0].data[0].to)
//
//             expect(from.balance).toBe(100)
//             expect(to.balance).toBe(100)
//         });
//
//         it('does not execute transaction if transaction made by not authorized person', async () => {
//             await digester.handleTransactions(events[5].data, events[5].publicKey)
//
//             const from = await storage.states.read(events[5].data[0].from)
//             const to = await storage.states.read(events[5].data[0].to)
//
//             expect(from.balance).toBe(100)
//             expect(to.balance).toBe(100)
//         });
//
//         it('does execute a transaction if validation is true', async () => {
//             await digester.handleTransactions(events[1].data, events[1].publicKey)
//
//             const from = await storage.states.read(events[1].data[0].from)
//             const to = await storage.states.read(events[1].data[0].to)
//
//             expect(from.balance).toBe(66)
//             expect(to.balance).toBe(134)
//         });
//
//         it('handles events that have multiple transactions', async () => {
//             await digester.handleTransactions(events[2].data, events[2].publicKey)
//
//             const from = await storage.states.read(events[2].data[0].from)
//             const to = await storage.states.read(events[2].data[0].to)
//
//             expect(from.balance).toBe(20)
//             expect(to.balance).toBe(180)
//         });
//
//         it('handles multiple events that have transactions', async () => {
//             await digester.digest(events)
//
//             const publicKeys = ['piet', 'henk', 'klaas', 'jan', 'geert'];
//             for (let i = 0; i < publicKeys.length; i++) {
//                 const state = await storage.states.read(publicKeys[i])
//
//                 switch (state.publicKey) {
//                     case 'piet': {
//                         expect(state.balance).toBe(118)
//                         break;
//                     }
//                     case 'henk': {
//                         expect(state.balance).toBe(66)
//                         break;
//                     }
//                     case 'klaas': {
//                         expect(state.balance).toBe(54)
//                         break;
//                     }
//                     case 'jan': {
//                         expect(state.balance).toBe(148)
//                         break;
//                     }
//                     case 'geert': {
//                         expect(state.balance).toBe(114)
//                         break;
//                     }
//                 }
//             }
//         });
//     })
//
//     describe('mirror', () => {
//         it('checks if the mirror setting is activated', async () => {
//             const setting = { key: 'mirror', value: 'true' }
//             await storage.settings.update(setting)
//
//             expect(digester.mirrorIsActive()).toBeTruthy();
//         });
//
//         it('puts events in database if mirroring is activated', async () => {
//             //TODO
//         });
//     })
//
// });