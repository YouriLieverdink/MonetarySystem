<template>
  <el-card class="view" :body-style="{padding: 0}">
    <div class="wallet_header">
      <el-tooltip class="header_item" content="Create new address" placement="bottom">
        <el-button
          plain
          size="mini"
          @click="showDialog.walletSetup = true"
          class="el-icon-plus"
          circle
        />
      </el-tooltip>
      <el-tooltip class="item" content="Import address" placement="bottom">
        <el-button
          plain
          size="mini"
          @click="() => {}"
          class="el-icon-plus"
          circle
        />
      </el-tooltip>
    </div>
    <el-tabs type="border-card" tab-position="left" class="tabs" stretch>
      <el-tab-pane>
        <span slot="label">Wallet Overview <i class="el-icon-wallet"></i></span>
        <el-skeleton :rows="6" animated />
<!--        <el- -->
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label">Addresses <i class="el-icon-notebook-1"></i></span>
        <el-skeleton :rows="4" animated />
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
export default {
  name: 'WalletView',
  data() {
    return {
      showDialog: {
        walletSetup: false
      }
    }
  }
}
</script>

<style scoped>
.view {
  background: #444;
}
.wallet_header {
  display: flex;
  flex-direction: row-reverse;
  padding: 12px;
  background: #222;
  border-radius: 4px 4px 0 0;
}
.tabs {
  height: 500px;
  border-radius: 0 0 4px 4px;
}
.header_item {
  margin-left: 8px;
}
</style>
