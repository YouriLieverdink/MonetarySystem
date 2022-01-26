import { RootState } from '~/store/modules/types';
import { ActionTree } from "vuex";
import { WalletState } from '~/store/modules/wallet/state';

import { IMPORT_ADDRESS } from '~/store/modules/wallet/types';

export const walletActions: ActionTree<WalletState, RootState> = {
  importAddress({ commit }, privateKey) {
    commit({
      type: IMPORT_ADDRESS,
      privateKey
    })
  },
}
