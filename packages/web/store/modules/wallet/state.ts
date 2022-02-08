import { Address, Transaction } from '~/core/types';

export type WalletState = {
  addresses: Address[]
  transactions: Transaction[]
  balance: number
}

export const walletState: WalletState = {
  addresses: [],
  transactions: [],
  balance: 0
}

export default walletState
