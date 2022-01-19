import { Event } from '../types';
import { Consensus, cEvent } from './consensus';
import { Crypto } from './crypto';

describe('Consensus', () => {
    //
    let crypto: Crypto;
    let hashgraph: Consensus<Event<never>>;
    let events: cEvent<never>[];
    let n: number;

    beforeAll(() => {
        crypto = new Crypto();
        events = [];
        n = 4;

        for (let i = 0; i < 35; i++) {
            events.push({
                id: `${i}`,
                timestamp: new Date(),
                publicKey: '',
                signature: ''
            });
        }

        // Add a signature to each event.
        [0, 8, 13, 15, 18, 22, 28, 30].forEach((i) => events[i].publicKey = 'Alice');
        [1, 5, 7, 11, 14, 20, 21, 24, 27, 29, 31, 34].forEach((i) => events[i].publicKey = 'Bob');
        [2, 10, 17, 26].forEach((i) => events[i].publicKey = 'Carol');
        [3, 4, 6, 9, 12, 16, 19, 23, 25, 32, 33].forEach((i) => events[i].publicKey = 'Dave');

        const h = (e: cEvent<never>) => crypto.createHash(e, [
            'consensus',
            'round',
            'witness'
        ]);

        const setParents = (x: number, selfParent: number, otherParent: number) => {
            events[x].selfParent = h(events[selfParent]);
            events[x].otherParent = h(events[otherParent]);
        };

        // Construct the hashgraph.
        setParents(4, 3, 1);
        setParents(5, 1, 4);
        setParents(6, 4, 5);
        setParents(7, 5, 2);
        setParents(8, 0, 5);
        setParents(9, 6, 7);
        setParents(10, 2, 7);
        setParents(11, 7, 9);
        setParents(12, 9, 8);
        setParents(13, 8, 12);
        setParents(14, 11, 12);
        setParents(15, 13, 10);
        setParents(16, 12, 14);
        setParents(17, 10, 15);
        setParents(18, 15, 15);
        setParents(19, 16, 18);
        setParents(20, 14, 18);
        setParents(21, 20, 19);
        setParents(22, 18, 21);
        setParents(23, 19, 21);
        setParents(24, 21, 22);
        setParents(25, 23, 17);
        setParents(26, 17, 25);
        setParents(27, 24, 22);
        setParents(28, 22, 27);
        setParents(29, 27, 26);
        setParents(30, 28, 29);
        setParents(31, 29, 30);
        setParents(32, 25, 29);
        setParents(33, 32, 26);
        setParents(34, 31, 33);
    });

    beforeEach(() => {
        hashgraph = new Consensus(crypto);
    });

    it('creates Crypto internally when not injected', () => {
        expect(() => new Consensus<string>()).not.toThrow();
    });

    describe('doConsensus', () => {

        describe('round', () => {

            it('is set to 0 when the event is a genesis event', () => {
                const cEvents = hashgraph.doConsensus(events, n);

                const event = cEvents.find((cEvent) => cEvent.id === events[0].id);

                expect(event.round).toBe(0);
            });

            it('is set to 0 when the event can\'t see the supermajority of witnesses', () => {
                const cEvents = hashgraph.doConsensus(events, n);

                const event = cEvents.find((cEvent) => cEvent.id === events[11].id);

                expect(event.round).toBe(0);
            });

            it('is set to 1 when the event can see the supermajority of witnesses', () => {
                const cEvents = hashgraph.doConsensus(events, n);

                const event = cEvents.find((cEvent) => cEvent.id === events[12].id);

                expect(event.round).toBe(1);
            });

            it('is set on every event', () => {
                const cEvents = hashgraph.doConsensus(events, n);

                const result = cEvents.some((cEvent) => cEvent.round === undefined);

                expect(result).toBeFalsy();
            });
        });

        describe('witness', () => {

            it('is set to true when the event is a genesis event', () => {
                const cEvents = hashgraph.doConsensus(events, n);

                const event = cEvents.find((cEvent) => cEvent.id === events[0].id);

                expect(event.witness).toBe(true);
            });

            it('is set to true when the event is the first of it\'s creator in a round', () => {
                const cEvents = hashgraph.doConsensus(events, n);

                const event = cEvents.find((cEvent) => cEvent.id === events[13].id);

                expect(event.witness).toBe(true);
            });

            it('is set to false when the event is not the first of it\'s creator in a round', () => {
                const cEvents = hashgraph.doConsensus(events, n);

                const event = cEvents.find((cEvent) => cEvent.id === events[15].id);

                expect(event.witness).toBe(false);
            });
        });
    });

    describe('helpers', () => {

        describe('canSee', () => {

            it('returns true when x and y are the same', () => {
                const result = hashgraph.helpers.canSee(events, events[0], events[0]);
                expect(result).toBeTruthy();
            });

            it('returns false when x is a genesis event', () => {
                const result = hashgraph.helpers.canSee(events, events[0], events[1]);
                expect(result).toBeFalsy();
            });

            it('returns true when y is a selfParent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[8], events[0]);
                expect(result).toBeTruthy();
            });

            it('returns false when y is not a selfParent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[8], events[13]);
                expect(result).toBeFalsy();
            });

            it('returns true when y is an otherParent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[7], events[2]);
                expect(result).toBeTruthy();
            });

            it('returns false when y is not an otherParent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[7], events[11]);
                expect(result).toBeFalsy();
            });

            it('returns true when y is a parent of a parent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[11], events[6]);
                expect(result).toBeTruthy();
            });

            it('returns true when y is a parent of a parent of a parent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[11], events[4]);
                expect(result).toBeTruthy();
            });
        });

        describe('canStronglySee', () => {

            it('returns false when x=12 and y=0', () => {
                const result = hashgraph.helpers.canStronglySee(events, events[12], events[0], n);
                expect(result).toBeFalsy();
            });

            it('returns true when x=12 and y=1', () => {
                const result = hashgraph.helpers.canStronglySee(events, events[12], events[1], n);
                expect(result).toBeTruthy();
            });

            it('returns true when x=12 and y=2', () => {
                const result = hashgraph.helpers.canStronglySee(events, events[12], events[2], n);
                expect(result).toBeTruthy();
            });

            it('returns true when x=12 and y=3', () => {
                const result = hashgraph.helpers.canStronglySee(events, events[12], events[3], n);
                expect(result).toBeTruthy();
            });
        });

        describe('selfParent', () => {

            it('returns undefined when the event is a genesis event', () => {
                const result = hashgraph.helpers.selfParent(events, events[0]);
                expect(result).toBeUndefined();
            });

            it('returns selfParent when the selfParent is found', () => {
                const result = hashgraph.helpers.selfParent(events, events[11]);
                expect(result).toEqual(events[7]);
            });
        });

        describe('otherParent', () => {

            it('returns undefined when the event is a genesis event', () => {
                const result = hashgraph.helpers.otherParent(events, events[0]);
                expect(result).toBeUndefined();
            });

            it('returns otherParent when the otherParent is found', () => {
                const result = hashgraph.helpers.otherParent(events, events[11]);
                expect(result).toEqual(events[9]);
            });
        });
    });
});