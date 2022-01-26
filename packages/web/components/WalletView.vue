<template>
  <el-card class="view">
    <div class="wallet_header">
      <el-tooltip class="item" content="Create new address" placement="bottom">
        <el-button
          type="primary"
          @click="showDialog.walletSetup = true"
          class="el-icon-circle-plus-outline"
          circle
        />
      </el-tooltip>
    </div>
    <el-tabs type="border-card" tab-position="left">
      <el-tab-pane label="Wallet overview">Tab 1</el-tab-pane>
      <el-tab-pane label="Addresses">Tab 2</el-tab-pane>
      <el-tab-pane label="Transactions">Tab 3</el-tab-pane>
      <el-tab-pane label="Settings">Tab 4</el-tab-pane>
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
  background: #333;
}
.wallet_header {
  display: flex;
  flex-direction: row-reverse;
  margin-bottom: 12px;
}
</style>
