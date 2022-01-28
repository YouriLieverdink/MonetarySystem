import { MutationTree } from "vuex";
import { WalletState } from './state';

import { REMOVE_ADDRESS, IMPORT_ADDRESS, SET_ADDRESSES } from '~/store/modules/wallet/types';

export const walletMutations: MutationTree<WalletState> = {
  [IMPORT_ADDRESS](state, { address }) {
    state.addresses = [...state.addresses, address]
  },
  [REMOVE_ADDRESS](state, { pubKey }) {
    state.addresses = state.addresses.filter(addr => addr.publicKey !== pubKey)
  },
  [SET_ADDRESSES](state, { addresses }) {
    state.addresses = addresses
  }
};
