import { Crypto } from '../services/_';

describe('Crypto', () => {
    let crypto: Crypto;

    beforeEach(() => {
        crypto = new Crypto();
    });

    describe('createKeys', () => {

        it('returns a public and private key', () => {
            const keys = crypto.createKeys();

            expect(keys.publicKey).not.toBeUndefined();
            expect(keys.privateKey).not.toBeUndefined();
        });

        it('returns the key without any padding', () => {
            const keys = crypto.createKeys();

            expect(keys.publicKey).not.toContain('BEGIN PUBLIC KEY');
            expect(keys.privateKey).not.toContain('BEGIN PRIVATE KEY');
        });
    });

    describe('createSignature', () => {

        it('creates the same signature with the same input', () => {
            const data = 'aap';
            const { privateKey } = crypto.createKeys();

            const s1 = crypto.createSignature(data, privateKey);
            const s2 = crypto.createSignature(data, privateKey);

            expect(s1).toEqual(s2);
        });
    });

    describe('derivePublicKey', () => {

        it('throws an error when the provided key is not valid', () => {
            const privateKey = 's3cr3t';

            expect(() => crypto.derivePublicKey(privateKey)).toThrow();
        });

        it('does not throw an error when the provided key is valid', () => {
            const { privateKey } = crypto.createKeys();

            expect(() => crypto.derivePublicKey(privateKey)).not.toThrow();
        });
    });

    describe('verifySignature', () => {

        it('returns true when the data has not been changed', () => {
            const { publicKey, privateKey } = crypto.createKeys();
            const data = 'aap';
            const signature = crypto.createSignature(data, privateKey);

            const result = crypto.verifySignature(data, signature, publicKey);
            expect(result).toBe(true);
        });

        it('returns false when the data has been changed', () => {
            const { publicKey, privateKey } = crypto.createKeys();
            let data = 'aap';
            const signature = crypto.createSignature(data, privateKey);

            data = 'schaap';

            const result = crypto.verifySignature(data, signature, publicKey);
            expect(result).toBe(false);
        });
    });

    describe('createHash', () => {

        it('returns the same hash when the same data has been provided', () => {
            const data = { animal: 'aap' };

            const h1 = crypto.createHash(data);
            const h2 = crypto.createHash(data);

            expect(h1).toEqual(h2);
        });

        it('returns the same hash when the keys not in `exclude` are the same', () => {
            const data1 = { animal: 'aap', age: 13 };
            const data2 = { animal: 'aap', age: 12 };

            const h1 = crypto.createHash(data1, ['age']);
            const h2 = crypto.createHash(data2, ['age']);

            expect(h1).toEqual(h2);
        });
    });

    describe('containsHash', () => {

        it('returns true when the hash has been found in the list', () => {
            const data = ['aap', 'schaap', 'koe', 'kip'];

            const hash = crypto.createHash('schaap');

            const result = crypto.containsHash(data, hash);

            expect(result).toBe(true);
        });

        it('returns true when the hash of the keys not in `exclude` are the same', () => {
            const data = [
                { animal: 'aap', age: 12 },
            ];

            const hash = crypto.createHash({ animal: 'aap', age: 13 }, ['age']);

            const result = crypto.containsHash(data, hash, ['age']);

            expect(result).toBe(true);
        });
    });
});