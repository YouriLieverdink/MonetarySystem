<template>
  <el-card class="view" :body-style="{padding: 0}" shadow="always">
    <div class="wallet_header">
      <div class="dialog_controls">
        <close-button disabled />
        <minimize-button disabled />
        <resize-button disabled />
      </div>
      <div class="action_buttons">
        <el-tooltip class="header_item" content="Node unreachable, retry" placement="bottom">
          <el-button
            plain
            circle
            type="danger"
            size="large"
            v-show="!connected"
            @click="retryConnection"
            class="action_button mdi mdi-connection"
          />
        </el-tooltip>
        <el-tooltip class="header_item" content="Generate invoice" placement="bottom">
          <el-button
            plain
            circle
            size="large"
            @click="showDialog.genInvoice = true"
            class="action_button mdi mdi-qrcode"
          />
        </el-tooltip>
        <el-tooltip class="header_item" content="Send funds" placement="bottom">
          <el-button
            plain
            circle
            size="medium"
            @click="showDialog.createTx = true"
            class="action_button el-icon-money"
          />
        </el-tooltip>
        <el-tooltip class="header_item" content="Add address" placement="bottom">
          <el-button
            plain
            circle
            size="medium"
            @click="showDialog.walletSetup = true"
            class="action_button el-icon-plus"
          />
        </el-tooltip>
      </div>
    </div>
    <el-tabs type="border-card" tab-position="left" class="tabs" stretch v-model="tab">
      <el-tab-pane name="overview">
        <span slot="label">Wallet Overview <i class="el-icon-wallet"></i></span>
        <el-card shadow="never" v-show="tab === 'overview'">
          <table style="width: 400px; margin: 24px auto">
            <tr class="summary_row" style="border-bottom: 1px solid #555">
              <td colspan="2" style="text-align: center"><strong>Wallet Overview</strong></td>
            </tr>
            <tr>
              <td colspan="2">
                <el-divider />
              </td>
            </tr>
            <tr class="summary_row">
              <td>Balance</td>
              <td>{{ walletSummary.balance }}</td>
            </tr>
            <tr class="summary_row">
              <td>Transactions</td>
              <td>{{ walletSummary.transactionCount }}</td>
            </tr>
            <tr class="summary_row">
              <td>Last activity</td>
              <td>{{ walletSummary.lastActivity }}</td>
            </tr>
          </table>
        </el-card>
      </el-tab-pane>
      <el-tab-pane name="addresses">
        <span slot="label">Addresses <i class="el-icon-notebook-1"></i></span>
        <transition name="el-fade-in-linear">
          <el-table v-show="tab === 'addresses'" :data="addresses" max-height="468px" :row-style="{'border-right': '1px solid #ff0000'}">
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
                  :disabled="!connected"
                  @click="handleRemoveAddress(row.publicKey)">Remove</el-button>
              </template>
            </el-table-column>
          </el-table>
        </transition>
      </el-tab-pane>
      <el-tab-pane name="transactions">
        <span slot="label">Transactions <i class="el-icon-coin"></i></span>
        <transition name="el-fade-in-linear">
          <el-table
            v-show="tab === 'transactions'"
            :data="transactions"
            max-height="468px">
            <el-table-column label="Sender" width="220">
              <template v-slot="{row}">
                {{
                  shortenKeyString(row.sender, 15)
                    .concat(addresses.filter(address =>
                      address.publicKey === row.sender).length > 0 ? ' (You)' : '')
                }}
              </template>
            </el-table-column>
            <el-table-column label="Receiver">
              <template v-slot="{row}">
                {{
                  shortenKeyString(row.receiver, 15)
                    .concat(addresses.filter(address =>
                      address.publicKey === row.receiver).length > 0 ? ' (You)' : '')}}
              </template>
            </el-table-column>
            <el-table-column
              label="Amount"
              prop="amount"
              sortable
              width="100"
            />
            <el-table-column
              label="When"
              sortable
              :sort-by="(row,i) => i">
              <template v-slot="{row}">
                {{dateString(row.timestamp)}}
              </template>
            </el-table-column>
          </el-table>
        </transition>
      </el-tab-pane>
      <el-tab-pane name="settings">
        <span slot="label">Settings <i class="el-icon-setting"></i></span>
        <transition name="el-fade-in-linear">
          <div v-show="tab === 'settings'">
            <el-card shadow="never">
              <el-row type="flex" align="middle">
                <el-col :span=10>Save full transaction history</el-col>
                <el-col :span=5>
                  <el-switch
                    :value="settings.mirror"
                    :disabled="!connected"
                    @change="settings.mirror = $event"
                  />
                </el-col>
              </el-row>
              <el-divider />
              <el-row type="flex" align="middle">
                <el-col :span=10>Clear data</el-col>
                <el-col :span=5>
                  <el-popconfirm
                    title="This action can not be undone!"
                    confirm-button-text='Proceed'
                    cancel-button-text='Cancel'
                    icon="el-icon-info"
                    icon-color="red"
                    @confirm="clearData"
                  >
                    <el-button
                      slot="reference"
                      type="danger"
                      :disabled="!connected"
                      plain
                      size="mini">
                      Clear data
                    </el-button>
                  </el-popconfirm>
                </el-col>
              </el-row>
            </el-card>
          </div>
        </transition>
      </el-tab-pane>
    </el-tabs>
    <wallet-setup-dialog
      :show="showDialog.walletSetup"
      @close="showDialog.walletSetup = false"
    />
    <create-transaction-dialog
      :show="showDialog.createTx"
      @close="showDialog.createTx = false"
    />
    <generate-invoice-dialog
      :show="showDialog.genInvoice"
      @close="showDialog.genInvoice = false"
    />
  </el-card>
</template>

<script>
import moment from 'moment';
import { mapActions, mapState } from 'vuex';
import { apiRequest } from '@/core/service/apiService';
import stringMixin from '@/components/mixin/stringMixin';

export default {
  name: 'WalletView',
  mixins: [stringMixin],
  data() {
    return {
      showDialog: {
        walletSetup: false,
        createTx: false,
        genInvoice: false
      },
      tab: 'overview',
      connected: true,
      settings: {
        mirror: true
      }
    }
  },
  computed: {
    ...mapState("wallet", {
      addresses: state => state.addresses,
      transactions: state => state.transactions,
      balance: state => state.balance,
    }),
    walletSummary() {
      const lastActivity = Math.max(...this.transactions.map(e => e?.timestamp ?? 0))
      return {
        balance: this.balance,
        transactionCount: this.transactions.length,
        lastActivity: this.transactions.length > 0
          ? lastActivity > 0
            ? moment(new Date(lastActivity), "YYYYMMDD").fromNow()
            : 'unknown'
          : 'never'
      }
    },
  },
  mounted() {
    this.refreshDispatcher()
  },
  methods: {
    ...mapActions("wallet", [
      "removeAddress",
      "setAddresses",
      "setTransactions",
      "setBalance"
    ]),
    async handleRemoveAddress(pubKey) {
      try {
        await apiRequest.addresses.remove(pubKey)
        this.removeAddress(pubKey)
      } catch(e) {
        this.$message.error('Address not removed')
        this.connected = e.response !== undefined
      }
    },
    async refreshAddresses() {
      try {
        const res = await apiRequest.addresses.get()
        this.setAddresses(res.data)
      } catch (e) {
        this.$message.error('Error updating your addresses')
        this.connected = e.response !== undefined
      }
    },
    async refreshTransactions() {
      let txs = []
      try {
        this.addresses.map(async ({ publicKey }) => {
          const res = await apiRequest.transactions.get(publicKey)
          txs = [...txs, res.data.map(({ sender, receiver, amount }) => ({
            sender,
            receiver,
            amount
          }))]
        })

        const newTxsAmount = txs.length - this.transactions.length
        if (newTxsAmount > 0)
          this.$notify.info({
            title: 'Info',
            message: newTxsAmount + ' new transactions'
          })

        console.log(txs.length)
        this.setTransactions(txs)
      } catch (e) {
        this.$message.error('Error updating your transactions')
        this.connected = e.response !== undefined
      }
    },
    async refreshBalance() {
      try {
        const res = await apiRequest.balances.get()
        this.setBalance(typeof res.data === 'number' ? res.data : 0)
      } catch (e) {
        this.$message.error('Error updating your balance')
        this.connected = e.response !== undefined
      }
    },
    dateString(date) {
      return date != null ? moment(date).format('lll') : 'unknown'
    },
    refreshDispatcher() {
      setTimeout(this.refreshDispatcher, 2000)

      if (this.connected) {
        this.refreshAddresses()
        this.refreshTransactions()
        this.refreshBalance()
      }
    },
    retryConnection() {
      this.connected = true
    },
    clearData() {
      Promise.all(this.addresses.map(a => this.handleRemoveAddress(a.publicKey)))
        .then(() => this.$message.success('Cleared application data'))
        .catch(() => this.$message.error('Could not clear application data'))
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
.action_button {
  padding:5px;
  font-size: 18px
}
.summary_row {
  font-size: 16px;
  height: 36px;
}
</style>
