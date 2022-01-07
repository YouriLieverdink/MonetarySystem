import { generateKeyPairSync } from 'crypto';

export class CryptoService {
    generateKeys(): { publicKey: string, privateKey: string } {
        const keyPair = generateKeyPairSync('ed25519' ,{
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });

        return {
            publicKey: this.stripKeyPadding(keyPair.publicKey),
            privateKey: this.stripKeyPadding(keyPair.privateKey)
        }
    }

    getPublicKey(privateKey: string): string {
        throw Error('Not implemented');
    }

    stripKeyPadding(string: string): string {
        return string.split('\n')[1]
    }

    addPublicKeyPadding(string: string): string {
        return '-----BEGIN PUBLIC KEY-----\n'+string+'\n-----END PUBLIC KEY-----';
    }

    addPrivateKeyPadding(string: string): string {
        return '-----BEGIN PRIVATE KEY-----\n'+string+'\n-----END PRIVATE KEY-----';
    }
}