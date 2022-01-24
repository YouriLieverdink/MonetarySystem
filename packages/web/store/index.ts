import Vue from 'vue';
import Vuex, { ModuleTree } from "vuex";
import VuexPersistence from "vuex-persist";
import { RootState } from '~/store/modules/types';
import { wallet } from '~/store/modules/wallet';

Vue.use(Vuex);

const vuexPersist = new VuexPersistence({
  storage: window.localStorage,
  modules: ["wallet"],
})


const modules: ModuleTree<RootState> = {
  wallet
}

const store = () => new Vuex.Store<RootState>({
  modules: modules,
  plugins: [vuexPersist.plugin],
})

export default store;
