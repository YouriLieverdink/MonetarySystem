import { RootState } from '~/store/modules/types';
import { ActionTree } from "vuex";
import { WalletState } from '~/store/modules/wallet/state';

import { REMOVE_ADDRESS, IMPORT_ADDRESS, SET_ADDRESSES } from '~/store/modules/wallet/types';

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
}
