import { Consensus, cEvent } from './consensus';
import { Crypto } from './crypto';

describe('Consensus', () => {
    //
    const crypto = new Crypto();
    const consensus = new Consensus<never>();
    const n = 4;

    let events: cEvent<never>[];

    /**
     * Creates and returns the hash of the provided event.
     * 
     * @param event The event to hash.
     */
    const createHash = <T>(event: cEvent<T>): string => {
        return crypto.createHash(event, ['consensus', 'round', 'witness', 'roundReceived', 'famous', 'timestamp']);
    };

    /**
     * Creates the parents of a given event.
     * 
     * @param events The available events.
     * @param event The index of the event to create the parents for.
     * @param selfParent The index of the event to use as self parent.
     * @param otherParent The index of the event to use as other parent.
     */
    const createParents = (events: cEvent<never>[], event: number, selfParent: number, otherParent: number) => {
        events[event].selfParent = createHash(events[selfParent]);
        events[event].otherParent = createHash(events[otherParent]);
    };

    beforeAll(() => {
        events = [];
        const now = new Date('January 10, 2022 10:00:00');

        // Construct a new hashgraph for every test.
        for (let i = 0; i < 35; i++) {
            // Create a predictable set of times for testing.
            const date = new Date(now.getTime() + (i * 60000));

            events.push({ id: `${i}`, createdAt: date, publicKey: '', signature: '' });
        }

        // Set the signature for each event.
        [0, 8, 13, 15, 18, 22, 28, 30].forEach((i) => events[i].publicKey = 'Alice');
        [1, 5, 7, 11, 14, 20, 21, 24, 27, 29, 31, 34].forEach((i) => events[i].publicKey = 'Bob');
        [2, 10, 17, 26].forEach((i) => events[i].publicKey = 'Carol');
        [3, 4, 6, 9, 12, 16, 19, 23, 25, 32, 33].forEach((i) => events[i].publicKey = 'Dave');

        // Set the parents for each event.
        createParents(events, 4, 3, 1);
        createParents(events, 5, 1, 4);
        createParents(events, 6, 4, 5);
        createParents(events, 7, 5, 2);
        createParents(events, 8, 0, 5);
        createParents(events, 9, 6, 7);
        createParents(events, 10, 2, 7);
        createParents(events, 11, 7, 9);
        createParents(events, 12, 9, 8);
        createParents(events, 13, 8, 12);
        createParents(events, 14, 11, 12);
        createParents(events, 15, 13, 10);
        createParents(events, 16, 12, 14);
        createParents(events, 17, 10, 15);
        createParents(events, 18, 15, 14);
        createParents(events, 19, 16, 18);
        createParents(events, 20, 14, 18);
        createParents(events, 21, 20, 19);
        createParents(events, 22, 18, 21);
        createParents(events, 23, 19, 21);
        createParents(events, 24, 21, 22);
        createParents(events, 25, 23, 17);
        createParents(events, 26, 17, 25);
        createParents(events, 27, 24, 22);
        createParents(events, 28, 22, 27);
        createParents(events, 29, 27, 26);
        createParents(events, 30, 28, 29);
        createParents(events, 31, 29, 30);
        createParents(events, 32, 25, 29);
        createParents(events, 33, 32, 26);
        createParents(events, 34, 31, 33);
    });

    it('creates Crypto internally when not injected', () => {
        expect(() => new Consensus<never>()).not.toThrow();
    });

    describe('doConsensus', () => {

        it('is run in', () => {
            consensus.doConsensus([...events], n);
        });

        describe('sets the round', () => {

            it('of an event to r when it a genesis event', () => {
                const cEvents = consensus.doConsensus([...events], n);

                const event = cEvents.find((cEvent) => cEvent.id === '1');

                expect(event.round).toBe(0);
            });

            it('of an event to r+1 when it can see the supermajority of witnesses in r', () => {
                const cEvents = consensus.doConsensus([...events], n);

                const event = cEvents.find((cEvent) => cEvent.id === '14');

                expect(event.round).toBe(1);
            });

            it('of an event to r when it can\'t see the supermajority of witnesses in r', () => {
                const cEvents = consensus.doConsensus([...events], n);

                const event = cEvents.find((cEvent) => cEvent.id === '11');

                expect(event.round).toBe(0);
            });
        });

        describe('sets the witness', () => {

            it('of an event to `true` when it is a genesis event', () => {
                const cEvents = consensus.doConsensus([...events], n);

                const event = cEvents.find((cEvent) => cEvent.id === '1');

                expect(event.witness).toBe(true);
            });

            it('of an event to `true` when it is the creator\'s first event in a round', () => {
                const cEvents = consensus.doConsensus([...events], n);

                const event = cEvents.find((cEvent) => cEvent.id === '14');

                expect(event.witness).toBe(true);
            });

            it('of an event to `false` when it is not the creator\'s first event in a round', () => {
                const cEvents = consensus.doConsensus([...events], n);

                const event = cEvents.find((cEvent) => cEvent.id === '16');

                expect(event.witness).toBe(false);
            });
        });

        describe('sets the received round', () => {

            it('of an event to r when all the famous witnesses in round r can see it', () => {
                let cEvents = [...events];

                // Mimic the decideFame method for now.
                [12, 13, 14, 17].forEach((id) => {
                    const index = cEvents.findIndex(
                        (cEvent) => cEvent.id === `${id}`,
                    );

                    // Only event 17 is not famous of the four.
                    cEvents[index].famous = id !== 17;
                });

                cEvents = consensus.doConsensus(cEvents, n);

                const event = cEvents.find((cEvent) => cEvent.id === '0');

                expect(event.roundReceived).toBe(1);
            });

            it('of an event to r+1 when all the famous witnesses in round r can\'t see it but they can in round r+1', () => {
                let cEvents = [...events];

                // Mimic the decideFame method for now.
                [12, 13, 14, 17, 21, 22, 23, 26].forEach((id) => {
                    const index = cEvents.findIndex(
                        (cEvent) => cEvent.id === `${id}`,
                    );

                    // Only event 17 is not famous of the four.
                    cEvents[index].famous = id !== 17;
                });

                cEvents = consensus.doConsensus(cEvents, n);

                const event = cEvents.find((cEvent) => cEvent.id === '11');

                expect(event.roundReceived).toBe(2);
            });
        });

        describe('sets the timestamp', () => {

            it('of an event to the median timestamp of the creators\' event who saw it first', () => {
                let cEvents = [...events];

                // Mimic the decideFame method for now.
                [12, 13, 14, 17].forEach((id) => {
                    const index = cEvents.findIndex(
                        (cEvent) => cEvent.id === `${id}`,
                    );

                    // Only event 17 is not famous of the four.
                    cEvents[index].famous = id !== 17;
                });

                cEvents = consensus.doConsensus(cEvents, n);

                const event = cEvents.find((cEvent) => cEvent.id === '8');

                // We can do this because the environment is predicatble.
                const median = cEvents.find((cEvent) => cEvent.id === '12');

                expect(event.timestamp).toStrictEqual(median.createdAt);
            });
        });
    });

    describe('helpers', () => {

        describe('selfAncestor', () => {

            it('returns true when x and y are the same', () => {
                const x = events.find((event) => event.id === '0');
                const y = events.find((event) => event.id === '0');

                const result = consensus.helpers.selfAncestor([...events], x, y);
                expect(result).toBe(true);
            });

            it('returns false when x is a gensis event', () => {
                const x = events.find((event) => event.id === '0');
                const y = events.find((event) => event.id === '1');

                const result = consensus.helpers.selfAncestor([...events], x, y);
                expect(result).toBe(false);
            });

            it('returns true when y is the self parent of x', () => {
                const x = events.find((event) => event.id === '8');
                const y = events.find((event) => event.id === '0');

                const result = consensus.helpers.selfAncestor([...events], x, y);
                expect(result).toBe(true);
            });

            it('returns true when y is the self parent of the self parent of x', () => {
                const x = events.find((event) => event.id === '13');
                const y = events.find((event) => event.id === '0');

                const result = consensus.helpers.selfAncestor([...events], x, y);
                expect(result).toBe(true);
            });
        });

        describe('canSee', () => {

            it('returns true when x and y are the same', () => {
                const x = events.find((event) => event.id === '0');
                const y = events.find((event) => event.id === '0');

                const result = consensus.helpers.canSee([...events], x, y);
                expect(result).toBeTruthy();
            });

            it('returns false when x is a genesis event', () => {
                const x = events.find((event) => event.id === '0');
                const y = events.find((event) => event.id === '1');

                const result = consensus.helpers.canSee([...events], x, y);
                expect(result).toBeFalsy();
            });

            it('returns true when y is a selfParent of x', () => {
                const x = events.find((event) => event.id === '8');
                const y = events.find((event) => event.id === '0');

                const result = consensus.helpers.canSee([...events], x, y);
                expect(result).toBeTruthy();
            });

            it('returns false when y is not a selfParent of x', () => {
                const x = events.find((event) => event.id === '8');
                const y = events.find((event) => event.id === '13');

                const result = consensus.helpers.canSee([...events], x, y);
                expect(result).toBeFalsy();
            });

            it('returns true when y is an otherParent of x', () => {
                const x = events.find((event) => event.id === '7');
                const y = events.find((event) => event.id === '2');

                const result = consensus.helpers.canSee([...events], x, y);
                expect(result).toBeTruthy();
            });

            it('returns false when y is not an otherParent of x', () => {
                const x = events.find((event) => event.id === '7');
                const y = events.find((event) => event.id === '11');

                const result = consensus.helpers.canSee([...events], x, y);
                expect(result).toBeFalsy();
            });

            it('returns true when y is a parent of a parent of x', () => {
                const x = events.find((event) => event.id === '11');
                const y = events.find((event) => event.id === '6');

                const result = consensus.helpers.canSee([...events], x, y);
                expect(result).toBeTruthy();
            });

            it('returns true when y is a parent of a parent of a parent of x', () => {
                const x = events.find((event) => event.id === '11');
                const y = events.find((event) => event.id === '4');

                const result = consensus.helpers.canSee([...events], x, y);
                expect(result).toBeTruthy();
            });
        });

        describe('canStronglySee', () => {

            it.each([
                { x: '12', y: '0', expected: false },
                { x: '12', y: '1', expected: true },
                { x: '12', y: '2', expected: true },
                { x: '12', y: '3', expected: true }
            ])(
                'returns $expected when x=$x and y=$y',
                ({ x, y, expected }) => {
                    const eventX = events.find((event) => event.id === x);
                    const eventY = events.find((event) => event.id === y);

                    const result = consensus.helpers.canStronglySee([...events], eventX, eventY, n);
                    expect(result).toBe(expected);
                },
            );
        });

        describe('selfParent', () => {

            it('returns undefined when the event is a genesis event', () => {
                const x = events.find((event) => event.id === '0');

                const result = consensus.helpers.selfParent([...events], x);
                expect(result).toBeUndefined();
            });

            it('returns selfParent when the selfParent is found', () => {
                const x = events.find((event) => event.id === '11');
                const y = events.find((event) => event.id === '7');

                const result = consensus.helpers.selfParent([...events], x);
                expect(result).toEqual(y);
            });
        });

        describe('otherParent', () => {

            it('returns undefined when the event is a genesis event', () => {
                const x = events.find((event) => event.id === '0');

                const result = consensus.helpers.otherParent([...events], x);
                expect(result).toBeUndefined();
            });

            it('returns otherParent when the otherParent is found', () => {
                const x = events.find((event) => event.id === '11');
                const y = events.find((event) => event.id === '9');

                const result = consensus.helpers.otherParent([...events], x);
                expect(result).toEqual(y);
            });
        });
    });
});