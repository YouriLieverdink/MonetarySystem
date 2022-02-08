import { walletActions } from '~/store/modules/wallet/actions';
import { walletMutations } from '~/store/modules/wallet/mutations';
import { WalletState, walletState } from '~/store/modules/wallet/state';

import { Module } from "vuex";
import { RootState } from "../types";

const wallet: Module<WalletState, RootState> = {
  namespaced: true,
  state: (walletState as WalletState),
  mutations: walletMutations,
  actions: walletActions
};

export { wallet };
