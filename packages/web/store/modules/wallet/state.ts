import { Address } from '~/core/types';

export type WalletState = {
  addresses: Address[]
}

export const walletState: WalletState = {
  addresses: []
}

export default walletState
