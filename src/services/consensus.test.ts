/* eslint-disable max-len */
import { Consensus } from './consensus';
import { Event, Header } from '../types';
import { Crypto } from './crypto';

describe('Consensus', () => {
    //
    let crypto: Crypto;
    let headers: Header[];
    let hashgraph: Consensus<Event<never>>;

    beforeAll(() => {
        crypto = new Crypto();
        const events: Event<never>[] = [];
        headers = [];

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

        const h = (e: Event<never>) => crypto.createHash(e);

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

        headers = [];
        for (let i = 0; i < 17; i++) {
            headers.push({
                consensus: false,
                body: events[i]
            });
        }
    });

    beforeEach(() => {
        hashgraph = new Consensus(crypto);
    });

    it('creates Crypto internally when not injected', () => {
        expect(() => new Consensus<string>()).not.toThrow();
    });

    describe('helpers', () => {

        describe('canSee', () => {

            it('returns true when x and y are the same', () => {
                const result = hashgraph.helpers.canSee(headers, headers[0], headers[0]);
                expect(result).toBeTruthy();
            });

            it('returns false when x is a genesis event', () => {
                const result = hashgraph.helpers.canSee(headers, headers[0], headers[1]);
                expect(result).toBeFalsy();
            });

            it('returns true when y is a selfParent of x', () => {
                const result = hashgraph.helpers.canSee(headers, headers[10], headers[0]);
                expect(result).toBeTruthy();
            });

            it('returns false when y is not a selfParent of x', () => {
                const result = hashgraph.helpers.canSee(headers, headers[10], headers[4]);
                expect(result).toBeFalsy();
            });

            it('returns true when y is an otherParent of x', () => {
                const result = hashgraph.helpers.canSee(headers, headers[10], headers[7]);
                expect(result).toBeTruthy();
            });

            it('returns false when y is not an otherParent of x', () => {
                const result = hashgraph.helpers.canSee(headers, headers[10], headers[4]);
                expect(result).toBeFalsy();
            });

            it('returns true when y is a parent of a parent of x', () => {
                const result = hashgraph.helpers.canSee(headers, headers[10], headers[5]);
                expect(result).toBeTruthy();
            });

            it('returns true when y is a parent of a parent of a parent of x', () => {
                const result = hashgraph.helpers.canSee(headers, headers[10], headers[3]);
                expect(result).toBeTruthy();
            });
        });

        describe('canStronglySee', () => {
            //
            it('returns false when x=16 and y=0', () => {
                const result = hashgraph.helpers.canStronglySee(headers, headers[16], headers[0], 5);
                expect(result).toBeFalsy();
            });

            it('returns true when x=16 and y=1', () => {
                const result = hashgraph.helpers.canStronglySee(headers, headers[16], headers[1], 5);
                expect(result).toBeTruthy();
            });

            it('returns true when x=16 and y=2', () => {
                const result = hashgraph.helpers.canStronglySee(headers, headers[16], headers[2], 5);
                expect(result).toBeTruthy();
            });

            it('returns true when x=16 and y=3', () => {
                const result = hashgraph.helpers.canStronglySee(headers, headers[16], headers[3], 5);
                expect(result).toBeTruthy();
            });

            it('returns true when x=16 and y=4', () => {
                const result = hashgraph.helpers.canStronglySee(headers, headers[16], headers[4], 5);
                expect(result).toBeTruthy();
            });
        });
    });

    describe('selfParent', () => {

        it('returns undefined when the event is a genesis event', () => {
            const result = hashgraph.helpers.selfParent(headers, headers[0]);
            expect(result).toBeUndefined();
        });

        it('returns selfParent when the selfParent is found', () => {
            const result = hashgraph.helpers.selfParent(headers, headers[12]);
            expect(result).toEqual(headers[8]);
        });
    });

    describe('otherParent', () => {

        it('returns undefined when the event is a genesis event', () => {
            const result = hashgraph.helpers.otherParent(headers, headers[0]);
            expect(result).toBeUndefined();
        });

        it('returns otherParent when the otherParent is found', () => {
            const result = hashgraph.helpers.otherParent(headers, headers[12]);
            expect(result).toEqual(headers[9]);
        });

        it('returns otherParent when the otherParent is found and header is changed', () => {
            headers[9].round = 1;
            const result = hashgraph.helpers.otherParent(headers, headers[12]);
            expect(result).toEqual(headers[9]);
        });
    });

    describe('witness', () => {
        it('returns true when a creators event is the first event of a round', () => {
            const divided: Header[] = hashgraph.divideRounds(headers, 5);
            const result = hashgraph.helpers.witness(divided, divided[0]);
            
            expect(result).toBeTruthy();
        });

        it('returns false when a creators event is not the first event of a round', () => {
            const divided: Header[] = hashgraph.divideRounds(headers, 5);
            const result = hashgraph.helpers.witness(divided, divided[12]);

            expect(result).toBeFalsy();
        });
    });
});