import { RootState } from '~/store/modules/types';
import { ActionTree } from "vuex";
import { WalletState } from '~/store/modules/wallet/state';

import {
  REMOVE_ADDRESS,
  IMPORT_ADDRESS,
  SET_ADDRESSES,
  SET_TRANSACTIONS,
  CREATE_TRANSACTION,
  SET_BALANCE
} from '~/store/modules/wallet/types';

export const walletActions: ActionTree<WalletState, RootState> = {
  importAddress({ commit }, address) {
    commit({
      type: IMPORT_ADDRESS,
      address
    })
  },
  removeAddress({ commit }, pubKey) {
    commit({
      type: REMOVE_ADDRESS,
      pubKey
    })
  },
  setAddresses({ commit }, addresses) {
    commit({
      type: SET_ADDRESSES,
      addresses
    })
  },
  setTransactions({ commit }, transactions) {
    commit({
      type: SET_TRANSACTIONS,
      transactions
    })
  },
  createTransaction({ commit }, transaction) {
    commit({
      type: CREATE_TRANSACTION,
      transaction
    })
  },
  setBalance({ commit }, balance) {
    commit({
      type: SET_BALANCE,
      balance
    })
  },
}
