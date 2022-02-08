import { Collection } from '../services/_';

describe('Collection', () => {
    let collection: Collection<string>;

    beforeEach(() => {
        collection = new Collection();
    });

    it('has a size of 0 when created', () => {
        expect(collection.size()).toBe(0);
    });

    describe('all', () => {

        it('returns a copy of items so the internal state stays immutable', () => {
            const items = ['aap'];
            collection.add(...items);

            const all = collection.all();
            all[0] = 'beer';

            const result = collection.all();
            expect(result).toEqual(items);
        });
    });

    describe('add', () => {

        it('an item to the collection when it is not alreay present', () => {
            const items = ['aap', 'aap'];
            collection.add(...items);

            const result = collection.size();
            expect(result).toBe(1);
        });
    });

    describe('remove', () => {

        it('an item from the collection when it was provided', () => {
            const items = ['aap'];
            collection.add(...items);

            collection.remove('aap');

            const result = collection.size();
            expect(result).toBe(0);
        });
    });

    describe('random', () => {

        it('excludes the provided item from the result', () => {
            const items = ['aap', 'beer'];
            collection.add(...items);

            const result = collection.random('beer');

            expect(result).toBe('aap');
        });
    });

    describe('shift', () => {

        it('returns the item first addded to the array', () => {
            const items = ['aap', 'beer'];
            collection.add(...items);

            const result = collection.shift();

            expect(result).toBe('aap');
        });

        it('modifies the collection', () => {
            const items = ['aap', 'beer'];
            collection.add(...items);

            collection.shift();

            expect(collection.size()).toBe(1);
        });
    });
});