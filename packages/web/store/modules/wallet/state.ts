import { Address } from '~/core/types';

export type WalletState = {
  addresses: Address[]
}

export const walletState: WalletState = {
  addresses: [
    {publicKey: 'testKey', privateKey: 'test', default: false},
    {publicKey: 'testKey1', privateKey: 'test', default: false},
    {publicKey: 'testKey2', privateKey: 'test', default: false},
  ]
}

export default walletState
