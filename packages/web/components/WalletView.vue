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
    <el-tabs type="border-card" tab-position="left" class="tabs" stretch value="transactions">
      <el-tab-pane name="overview">
        <span slot="label">Wallet Overview <i class="el-icon-wallet"></i></span>
        <el-skeleton :rows="6" animated />
      </el-tab-pane>
      <el-tab-pane name="addresses">
        <span slot="label">Addresses <i class="el-icon-notebook-1"></i></span>
        <el-table :data="addresses" max-height="468px" :row-style="{'border-right': '1px solid #ff0000'}">
          <el-table-column
            label="Public key">
            <template v-slot="{row}">
              {{ shortenKeyString(row.publicKey, 40) }}
            </template>
          </el-table-column>
          <el-table-column
            align="right">
            <template #header>
              Total: {{addresses.length}}
            </template>
            <template slot-scope="{ row }">
              <el-button
                size="mini"
                type="danger"
                @click="handleRemoveAddress(row.publicKey)">Remove</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane name="transactions">
        <span slot="label">Transactions <i class="el-icon-coin"></i></span>
        <el-table :data="transactions" max-height="468px">
          <el-table-column
            label="Sender">
            <template v-slot="{row}">
              {{ shortenKeyString(row.sender, 15) }}
            </template>
          </el-table-column>
          <el-table-column
            label="Receiver">
            <template v-slot="{row}">
              {{ shortenKeyString(row.receiver, 15) }}
            </template>
          </el-table-column>
          <el-table-column
            label="Amount">
            <template v-slot="{row}">
              {{ row.amount }}
            </template>
          </el-table-column>
          <el-table-column
            align="right">
            <template #header>
              Total: {{transactions.length}}
            </template>
            <template v-slot="{row}">
              <el-tag v-if="row.confirmed === true" type="success">Confirmed</el-tag>
              <el-tag v-else type="info">Unconfirmed</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane name="settings">
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
import { mapActions, mapState } from 'vuex';
import { apiRequest } from '@/core/service/apiService';
import stringMixin from '@/components/mixin/stringMixin';

export default {
  name: 'WalletView',
  mixins: [stringMixin],
  data() {
    return {
      showDialog: {
        walletSetup: false
      }
    }
  },
  computed: {
    ...mapState("wallet", {
      addresses: state => state.addresses,
      transactions: state => state.transactions,
    }),
  },
  mounted() {
    this.refreshAddresses()
    this.refreshTransactions()
  },
  methods: {
    ...mapActions("wallet", [
      "removeAddress",
      "setAddresses",
      "setTransactions"
    ]),
    async handleRemoveAddress(pubKey) {
      try {
        await apiRequest.addresses.remove(pubKey)
        this.removeAddress(pubKey)
      } catch(e) {
        this.$message.error('Error - Address not removed')
      }
    },
    async refreshAddresses() {
      try {
        const res = await apiRequest.addresses.get()
        this.setAddresses(res.data)
      } catch (e) {
        this.$message('Error updating your addresses')
      }
    },
    async refreshTransactions() {
      try {
        const res = await apiRequest.transactions.get()
        this.setTransactions(res.data)
      } catch (e) {
        this.$message('Error updating your transactions')
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
