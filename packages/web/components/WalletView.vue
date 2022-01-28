<template>
  <el-card class="view" :body-style="{padding: 0}">
    <div class="wallet_header">
      <div class="dialog_controls">
        <close-button disabled />
        <minimize-button disabled />
        <resize-button disabled />
      </div>
      <div class="action_buttons">
        <el-tooltip class="header_item" content="Send funds" placement="bottom">
          <el-button
            plain
            circle
            size="medium"
            @click="() => {}"
            class="el-icon-money"
          />
        </el-tooltip>
        <el-tooltip class="header_item" content="Add address" placement="bottom">
          <el-button
            plain
            circle
            size="medium"
            @click="showDialog.walletSetup = true"
            class="el-icon-plus"
          />
        </el-tooltip>
      </div>
    </div>
    <el-tabs type="border-card" tab-position="left" class="tabs" stretch>
      <el-tab-pane>
        <span slot="label">Wallet Overview <i class="el-icon-wallet"></i></span>
        <el-skeleton :rows="6" animated />
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label">Addresses <i class="el-icon-notebook-1"></i></span>
        <el-table :data="addresses">
          <el-table-column
            prop="publicKey"
            label="Public key" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label">Transactions <i class="el-icon-coin"></i></span>
        <el-skeleton :rows="3" animated />
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label">Settings <i class="el-icon-setting"></i></span>
        <el-skeleton :rows="5" animated />
      </el-tab-pane>
    </el-tabs>
    <wallet-setup-dialog
      :show="showDialog.walletSetup"
      @close="showDialog.walletSetup = false"
    />
  </el-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'WalletView',
  data() {
    return {
      showDialog: {
        walletSetup: false
      }
    }
  },
  computed: {
    ...mapState("wallet", {
      addresses: state => state.addresses
    }),
  }
}
</script>

<style scoped>
.view {
  background: #444;
}
.wallet_header {
  display: flow-root;
  padding: 12px;
  background: #222;
  border-radius: 4px 4px 0 0;
}
.dialog_controls {
  float: left;
  margin-top: 10px;
}
.action_buttons {
  float: right;
}
.tabs {
  height: 500px;
  border-radius: 0 0 4px 4px;
}
.header_item {
  margin-left: 12px;
}
</style>
