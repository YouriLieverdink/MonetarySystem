import { createHash, createPublicKey, generateKeyPairSync, sign, verify } from 'crypto';
import _ from 'lodash';
import { Address } from '../types/_';

export class Crypto {
    /**
     * Generates new keys using the ed25519 scheme.
     * 
     * @returns The created key pair.
     */
    public createAddress(): Address {
        //
        const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        return {
            publicKey: this.removePadding(publicKey),
            privateKey: this.removePadding(privateKey),
            isDefault: 0
        };
    }

    /**
     * Creates a signature for the data with the private key.
     * 
     * @param data The data to sign.
     * @param privateKey The private key to sign the data with.
     * @returns A signature.
     */
    public createSignature<T>(
        data: T,
        privateKey: string,
    ): string {
        //
        const verifiable = JSON.stringify(data);

        const signature = sign(
            null,
            Buffer.from(verifiable),
            {
                key: this.addPadding(privateKey, false),
                type: 'pkcs8'
            }
        );

        return signature.toString('base64');
    }

    /**
     * Derives the public key from the private key.
     * 
     * @param privateKey The private key to derive the public key from.
     * @returns The public key.
     */
    public derivePublicKey(
        privateKey: string,
    ): string {
        //
        const publicKey = createPublicKey(
            this.addPadding(privateKey, false)
        );

        return this.removePadding(publicKey
            .export({ type: 'spki', format: 'pem' })
            .toString('base64')
        );
    }

    /**
     * Verifies if the signature/data is correct.
     * 
     * @param data The data to verify.
     * @param signature The signature that was provided with the data.
     * @param publicKey The public key of the 'claiming' sender.
     * @returns Whether the signature is correct.
     */
    public verifySignature<T>(
        data: T,
        signature: string,
        publicKey: string,
    ): boolean {
        //
        const verifiable = JSON.stringify(data);

        return verify(
            null,
            Buffer.from(verifiable),
            {
                key: this.addPadding(publicKey),
                type: 'spki'
            },
            Buffer.from(signature, 'base64')
        );
    }

    /**
     * Adds the padding before and after the key.
     * 
     * @param key The key to add the padding around.
     * @param isPublic Whether it is the public key.
     * @returns The key with padding.
     */
    private addPadding(key: string, isPublic = true): string {
        return [
            `-----BEGIN ${isPublic ? 'PUBLIC' : 'PRIVATE'} KEY-----`,
            key,
            `-----END ${isPublic ? 'PUBLIC' : 'PRIVATE'} KEY-----`
        ].join('\n');
    }

    /**
     * Removes the padding before and after te key.
     * 
     * @param key The key to remove the padding from.
     * @returns The key without padding.
     */
    private removePadding(key: string): string {
        return key.split('\n')[1];
    }

    /**
     * Hashes the provided data using sha256.
     *
     * @param data The data to hash.
     * @param except The keys to exclude.
     */
    public createHash<T>(data: T, except: string[] = []): string {
        //
        data = _.omit(data as Object, except) as T;
        const hashable = JSON.stringify(data);

        return createHash('sha256').update(hashable).digest('hex');
    }

    /**
     * Returns true when the hash of an item equals hash.
     * 
     * @param items The items to check the hashes o.
     * @param hash The hash to find.
     * @param except The keys to exclude.
     */
    public containsHash<T>(items: T[], hash: string, except: string[] = []): boolean {
        //
        return items.some((item) => this.createHash(item, except) === hash);
    }
}