import { Address, Transaction } from '~/core/types';

export type WalletState = {
  addresses: Address[]
  transactions: Transaction[]
}

export const walletState: WalletState = {
  addresses: [],
  transactions: []
}

export default walletState
