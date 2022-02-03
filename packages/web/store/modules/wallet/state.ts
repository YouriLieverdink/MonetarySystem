import { Address, Transaction } from '~/core/types';

export type WalletState = {
  addresses: Address[]
  transactions: Transaction[]
}

export const walletState: WalletState = {
  addresses: [],
  transactions: [{
    sender: "MCowBQYDK2VwAyEA2bnS+oM70NHusUitIQSdLs9ABJ3lhZP+UnqwTZDhQgw=",
    receiver: "FAKE......iUfOswAyEA2bnS+oM70NHusUitIQSdLs9ABJ3lhZP+Unqw...ADDRESS",
    amount: 10,
    date: undefined,
    confirmed: true
  },{
    sender: "MCowBQYDK2VwAyEA2bnS+oM70NHusUitIQSdLs9ABJ3lhZP+UnqwTZDhQgw=",
    receiver: "FAKE......iUfOswAyEA2bnS+oM70NHusUitIQSdLs9ABJ3lhZP+Unqw...ADDRESS",
    amount: 8,
    date: undefined,
    confirmed: false
  }]
}

export default walletState
