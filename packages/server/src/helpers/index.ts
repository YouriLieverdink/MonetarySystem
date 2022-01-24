import { Crypto } from '../services/crypto';

/**
 * Returns true when the has of any item in `items` matches the provided `hash`.
 * 
 * @param items The item to check.
 * @param hash The hash to compare the items against.
 */
export const containsHash = <T>(items: T[], hash: string): boolean => {
    //
    const crypto = new Crypto();

    return items.some((item) => {
        return crypto.createHash(item) === hash;
    });
};