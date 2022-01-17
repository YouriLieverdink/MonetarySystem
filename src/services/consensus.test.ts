import { Event } from '../types';
import { Consensus } from './consensus';
import { Crypto } from './crypto';

describe('Consensus', () => {
    //
    let crypto: Crypto;
    let hashgraph: Consensus<Event<never>>;
    let events: Event<never>[];
    let n: number;

    beforeEach(() => {
        crypto = new Crypto();
        hashgraph = new Consensus(crypto);
        events = [];
        n = 5;

        for (let i = 0; i < 17; i++) {
            events.push({
                id: `${i}`,
                timestamp: new Date(),
                publicKey: '',
                signature: ''
            });
        }

        // Add a signature to each event.
        [0, 10, 13].forEach((i) => events[i].publicKey = 'Alice');
        [1, 7, 11].forEach((i) => events[i].publicKey = 'Bob');
        [2, 5, 8, 12, 15, 16].forEach((i) => events[i].publicKey = 'Carol');
        [3, 9].forEach((i) => events[i].publicKey = 'Dave');
        [4, 6, 14].forEach((i) => events[i].publicKey = 'Ed');

        const h = (e: Event<never>) => crypto.createHash(e as Event<never>);

        // Construct the hashgraph.
        events[5].selfParent = h(events[2]);
        events[5].otherParent = h(events[3]);

        events[6].selfParent = h(events[4]);
        events[6].otherParent = h(events[1]);

        events[7].selfParent = h(events[1]);
        events[7].otherParent = h(events[5]);

        events[8].selfParent = h(events[5]);
        events[8].otherParent = h(events[6]);

        events[9].selfParent = h(events[3]);
        events[9].otherParent = h(events[8]);

        events[10].selfParent = h(events[0]);
        events[10].otherParent = h(events[7]);

        events[11].selfParent = h(events[7]);
        events[11].otherParent = h(events[8]);

        events[12].selfParent = h(events[8]);
        events[12].otherParent = h(events[9]);

        events[13].selfParent = h(events[10]);
        events[13].otherParent = h(events[11]);

        events[14].selfParent = h(events[6]);
        events[14].otherParent = h(events[1]);

        events[15].selfParent = h(events[12]);
        events[15].otherParent = h(events[14]);

        events[16].selfParent = h(events[15]);
        events[16].otherParent = h(events[13]);
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

                const event = cEvents.find((cEvent) => cEvent.id === events[15].id);

                expect(event.round).toBe(0);
            });

            it('is set to 1 when the event can see the supermajority of witnesses', () => {
                const cEvents = hashgraph.doConsensus(events, n);

                const event = cEvents.find((cEvent) => cEvent.id === events[16].id);

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

                const event = cEvents.find((cEvent) => cEvent.id === events[16].id);

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
                const result = hashgraph.helpers.canSee(events, events[10], events[0]);
                expect(result).toBeTruthy();
            });

            it('returns false when y is not a selfParent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[10], events[4]);
                expect(result).toBeFalsy();
            });

            it('returns true when y is an otherParent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[10], events[7]);
                expect(result).toBeTruthy();
            });

            it('returns false when y is not an otherParent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[10], events[4]);
                expect(result).toBeFalsy();
            });

            it('returns true when y is a parent of a parent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[10], events[5]);
                expect(result).toBeTruthy();
            });

            it('returns true when y is a parent of a parent of a parent of x', () => {
                const result = hashgraph.helpers.canSee(events, events[10], events[3]);
                expect(result).toBeTruthy();
            });
        });

        describe('canStronglySee', () => {

            it('returns false when x=16 and y=0', () => {
                const result = hashgraph.helpers.canStronglySee(events, events[16], events[0], n);
                expect(result).toBeFalsy();
            });

            it('returns true when x=16 and y=1', () => {
                const result = hashgraph.helpers.canStronglySee(events, events[16], events[1], n);
                expect(result).toBeTruthy();
            });

            it('returns true when x=16 and y=2', () => {
                const result = hashgraph.helpers.canStronglySee(events, events[16], events[2], n);
                expect(result).toBeTruthy();
            });

            it('returns true when x=16 and y=3', () => {
                const result = hashgraph.helpers.canStronglySee(events, events[16], events[3], n);
                expect(result).toBeTruthy();
            });

            it('returns true when x=16 and y=4', () => {
                const result = hashgraph.helpers.canStronglySee(events, events[16], events[4], n);
                expect(result).toBeTruthy();
            });
        });

        describe('selfParent', () => {

            it('returns undefined when the event is a genesis event', () => {
                const result = hashgraph.helpers.selfParent(events, events[0]);
                expect(result).toBeUndefined();
            });

            it('returns selfParent when the selfParent is found', () => {
                const result = hashgraph.helpers.selfParent(events, events[12]);
                expect(result).toEqual(events[8]);
            });
        });

        describe('otherParent', () => {

            it('returns undefined when the event is a genesis event', () => {
                const result = hashgraph.helpers.otherParent(events, events[0]);
                expect(result).toBeUndefined();
            });

            it('returns otherParent when the otherParent is found', () => {
                const result = hashgraph.helpers.otherParent(events, events[12]);
                expect(result).toEqual(events[9]);
            });
        });
    });
});