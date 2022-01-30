import { createHash } from 'crypto';
import { canSee, canStronglySee, createIndex, decideFame, divideRounds, findOrder, Index, _Event } from './index';

describe('Consensus', () => {
    //
    let events: _Event<never>[];
    let index: Index<never>;

    const h = <T>(x: _Event<T>): string => {
        const hashable = JSON.stringify(x);
        return createHash('sha256').update(hashable).digest('hex');
    };

    const c = <T>(events: _Event<T>[], x: number, self: number, other: number): void => {
        events[x].selfParent = h(events[self]);
        events[x].otherParent = h(events[other]);
    };

    /**
     * We construct a `test`-hashgraph based on an image from a explanation
     * video so we can see if the implementation is valid.
     */
    beforeAll(() => {
        events = [];
        const now = Date.now();

        for (let i = 0; i < 35; i++) {
            // Create a predictable set of times for testing.
            const date = now + (i * 60000)

            events.push({ id: `${i}`, createdAt: date, publicKey: '', signature: '' });
        }

        // Set the signature for each event.
        [0, 8, 13, 15, 18, 22, 28, 30].forEach((i) => events[i].publicKey = 'Alice');
        [1, 5, 7, 11, 14, 20, 21, 24, 27, 29, 31, 34].forEach((i) => events[i].publicKey = 'Bob');
        [2, 10, 17, 26].forEach((i) => events[i].publicKey = 'Carol');
        [3, 4, 6, 9, 12, 16, 19, 23, 25, 32, 33].forEach((i) => events[i].publicKey = 'Dave');

        // Set the parents for each event.
        c(events, 4, 3, 1);
        c(events, 5, 1, 4);
        c(events, 6, 4, 5);
        c(events, 7, 5, 2);
        c(events, 8, 0, 5);
        c(events, 9, 6, 7);
        c(events, 10, 2, 7);
        c(events, 11, 7, 9);
        c(events, 12, 9, 8);
        c(events, 13, 8, 12);
        c(events, 14, 11, 12);
        c(events, 15, 13, 10);
        c(events, 16, 12, 14);
        c(events, 17, 10, 15);
        c(events, 18, 15, 14);
        c(events, 19, 16, 18);
        c(events, 20, 14, 18);
        c(events, 21, 20, 19);
        c(events, 22, 18, 21);
        c(events, 23, 19, 21);
        c(events, 24, 21, 22);
        c(events, 25, 23, 17);
        c(events, 26, 17, 25);
        c(events, 27, 24, 22);
        c(events, 28, 22, 27);
        c(events, 29, 27, 26);
        c(events, 30, 28, 29);
        c(events, 31, 29, 30);
        c(events, 32, 25, 29);
        c(events, 33, 32, 26);
        c(events, 34, 31, 33);

        index = createIndex(events);
    });

    it('runs the algorithm in', () => {
        divideRounds(index, 4);
    });

    describe('canSee', () => {

        it('returns true when x and y are the same', () => {
            const x = h(events.find((event) => event.id === '0'));
            const y = h(events.find((event) => event.id === '0'));

            const result = canSee(index, x, y);
            expect(result).toBe(true);
        });

        it('returns false when x is a genesis event', () => {
            const x = h(events.find((event) => event.id === '0'));
            const y = h(events.find((event) => event.id === '1'));

            const result = canSee(index, x, y);
            expect(result).toBe(false);
        });

        it('returns true when y is a selfParent of x', () => {
            const x = h(events.find((event) => event.id === '8'));
            const y = h(events.find((event) => event.id === '0'));

            const result = canSee(index, x, y);
            expect(result).toBe(true);
        });

        it('returns false when y is not a selfParent of x', () => {
            const x = h(events.find((event) => event.id === '8'));
            const y = h(events.find((event) => event.id === '13'));

            const result = canSee(index, x, y);
            expect(result).toBe(false);
        });

        it('returns true when y is a otherParent of x', () => {
            const x = h(events.find((event) => event.id === '7'));
            const y = h(events.find((event) => event.id === '2'));

            const result = canSee(index, x, y);
            expect(result).toBe(true);
        });

        it('returns false when y is not a otherParent of x', () => {
            const x = h(events.find((event) => event.id === '7'));
            const y = h(events.find((event) => event.id === '11'));

            const result = canSee(index, x, y);
            expect(result).toBe(false);
        });

        it('returns true when y is a parent of a parent of x', () => {
            const x = h(events.find((event) => event.id === '11'));
            const y = h(events.find((event) => event.id === '6'));

            const result = canSee(index, x, y);
            expect(result).toBe(true);
        });

        it('returns true when y is a parent of a parent of a parent of x', () => {
            const x = h(events.find((event) => event.id === '11'));
            const y = h(events.find((event) => event.id === '4'));

            const result = canSee(index, x, y);
            expect(result).toBe(true);
        });
    });

    describe('canStronglySee', () => {

        it.each([
            { xId: '12', yId: '0', expected: false },
            { xId: '12', yId: '1', expected: true },
            { xId: '12', yId: '2', expected: true },
            { xId: '12', yId: '3', expected: true }
        ])(
            'returns $expected when x=$xId and y=$yId',
            ({ xId, yId, expected }) => {
                const x = h(events.find((event) => event.id === xId));
                const y = h(events.find((event) => event.id === yId));

                const result = canStronglySee(index, x, y, 4);
                expect(result).toBe(expected);
            },
        );
    });

    describe('divideRounds', () => {

        describe('sets the round', () => {

            it('of an event to r when it a genesis event', () => {
                const cIndex = divideRounds(index, 4);

                const event = Object.values(cIndex).find((cEvent) => cEvent.id === '1');
                expect(event.round).toBe(0);
            });

            it('of an event to r+1 when it can see the supermajority of witnesses in r', () => {
                const cIndex = divideRounds(index, 4);

                const event = Object.values(cIndex).find((cEvent) => cEvent.id === '14');

                expect(event.round).toBe(1);
            });

            it('of an event to r when it can\'t see the supermajority of witnesses in r', () => {
                const cIndex = divideRounds(index, 4);

                const event = Object.values(cIndex).find((cEvent) => cEvent.id === '11');

                expect(event.round).toBe(0);
            });
        });

        describe('sets the witness', () => {

            it('of an event to `true` when it is a genesis event', () => {
                const cIndex = divideRounds(index, 4);

                const event = Object.values(cIndex).find((cEvent) => cEvent.id === '1');

                expect(event.witness).toBe(true);
            });

            it('of an event to `true` when it is the creator\'s first event in a round', () => {
                const cIndex = divideRounds(index, 4);

                const event = Object.values(cIndex).find((cEvent) => cEvent.id === '14');

                expect(event.witness).toBe(true);
            });

            it('of an event to `false` when it is not the creator\'s first event in a round', () => {
                const cIndex = divideRounds(index, 4);

                const event = Object.values(cIndex).find((cEvent) => cEvent.id === '16');

                expect(event.witness).toBe(false);
            });
        });
    });

    describe('decideFame', () => {

        describe('sets the famous', () => {

            it.each(['0', '1', '2', '3', '12', '13', '14'])(
                'of x=%i to `true` when it is famous',
                (id) => {
                    let cIndex = divideRounds(index, 4);
                    cIndex = decideFame(cIndex, 4);

                    const event = Object.values(cIndex).find((cEvent) => cEvent.id === id);

                    expect(event.famous).toBe(true);
                }
            );

            it.each(['17'])(
                'of x=%i to `false` when it is not famous but voted on',
                (id) => {
                    let cIndex = divideRounds(index, 4);
                    cIndex = decideFame(cIndex, 4);

                    const event = Object.values(cIndex).find((cEvent) => cEvent.id === id);

                    expect(event.famous).toBe(false);
                }
            );

            it.each(['7', '21'])(
                'of an event to undefined when it has not yet been voted on',
                (id) => {
                    let cIndex = divideRounds(index, 4);
                    cIndex = decideFame(cIndex, 4);

                    const event = Object.values(cIndex).find((cEvent) => cEvent.id === id);

                    expect(event.famous).toBe(undefined);
                }
            );
        });
    });

    describe('findOrder', () => {

        describe('sets the received round', () => {

            it('of an event to r when all the famous witnesses in round r can see it', () => {
                let cIndex = divideRounds(index, 4);
                cIndex = decideFame(cIndex, 4);
                cIndex = findOrder(cIndex);

                const event = Object.values(cIndex).find((event) => event.id === '0');

                expect(event.roundReceived).toBe(1);
            });

            it('of an event to r+1 when all the famous witnesses in round r can\'t see it but they can in round r+1', () => {
                let cIndex = divideRounds(index, 4);
                cIndex = decideFame(cIndex, 4);

                // With the current number of events it is impossible to decide fame for these events.
                [21, 22, 23, 26].forEach((id) => {
                    //
                    const event = events.find((e) => e.id === `${id}`);
                    const hx = h(event);

                    cIndex[hx] = { ...cIndex[hx], famous: true };
                });

                cIndex = findOrder(cIndex);

                const event = Object.values(cIndex).find((event) => event.id === '11');

                expect(event.roundReceived).toBe(2);
            });
        });

        describe('sets the timestamp', () => {

            it('of an event to the median timestamp of the creators\' event who saw it first', () => {
                let cIndex = divideRounds(index, 4);
                cIndex = decideFame(cIndex, 4);
                cIndex = findOrder(cIndex);

                const event = Object.values(cIndex).find((event) => event.id === '8');

                const median = Object.values(cIndex).find((event) => event.id === '12');

                expect(event.timestamp).toEqual(median.createdAt);
            });
        });
    });
});