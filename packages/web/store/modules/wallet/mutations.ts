import { MutationTree } from "vuex";
import { WalletState } from './state';

import { IMPORT_ADDRESS } from '~/store/modules/wallet/types';

export const walletMutations: MutationTree<WalletState> = {
  [IMPORT_ADDRESS](state, { address }) {
    state.addresses = [...state.addresses, address]
  },
};
