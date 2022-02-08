<template>
  <el-dialog
    :visible.sync="show"
    :before-close="handleClose"
    :show-close="false"
    :fullscreen="fullscreen"
    width="600px"
    append-to-body>
    <template #title>
      <div class="window_header">
        <div>
          <close-button @click="$emit('close')"/>
          <minimize-button disabled />
          <resize-button @click="fullscreen = !fullscreen"/>
        </div>
        <span class="window_title">Send funds</span>
      </div>
    </template>
    <div class="content">
      <el-form @submit.prevent.native="handleCreateTransaction">
        <el-row class="bottom-margin">
          <el-col :span="8" class="input_label">Amount</el-col>
          <el-col :span="16">
            <el-input-number
              v-model="amountInput"
              :min="1"
              class="fit-parent"
            />
          </el-col>
        </el-row>
        <el-row class="bottom-margin">
          <el-col :span="8" class="input_label">Source</el-col>
          <el-col :span="16">
            <el-select
              v-model="senderInput"
              filterable
              no-data-text="Please create an address first"
              no-match-text="No addresses found"
              placeholder="Select"
              class="fit-parent">
              <el-option
                v-for="item in addresses"
                :key="item.publicKey"
                :label="item.publicKey"
                :value="item.publicKey">
              </el-option>
            </el-select>
          </el-col>
        </el-row>
        <el-row class="bottom-margin">
          <el-col :span="8" class="input_label">Destination</el-col>
          <el-col :span="16">
          <el-input
            v-model="receiverInput"
            type="text"
            placeholder="Public key of the receiver"
            class="fit-parent"
          />
          </el-col>
        </el-row>
        <el-button
          type="primary"
          class="btn"
          v-text="sendLoading ? ' Sending' : 'Send'"
          :loading="sendLoading"
          @click="handleCreateTransaction"
        />
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { apiRequest } from '@/core/service/apiService';

export default {
  name: 'CreateTransactionDialog',
  props: {
    show: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data() {
    return {
      receiverInput: "",
      senderInput: "",
      amountInput: 0,
      sendLoading: false,
      fullscreen: false
    }
  },
  computed: {
    ...mapState("wallet", {
      addresses: state => state.addresses
    }),
  },
  methods: {
    ...mapActions("wallet", [
      'createTransaction'
    ]),
    async handleCreateTransaction() {
      this.sendLoading = true

      const senderInput = this.senderInput
      const receiverInput = this.receiverInput
      const amountInput = this.amountInput

      try {
        if (senderInput.length < 40)
          throw Error('Please select a valid source address')
        if (receiverInput.length < 40)
          throw Error('Please enter a valid destination address')
        if (amountInput <= 0)
          throw Error('Please enter a valid amount')



        await apiRequest.transactions.create(senderInput, receiverInput, amountInput)
        this.createTransaction({
          sender: senderInput,
          receiver: receiverInput,
          amount: amountInput
        })

        this.amountInput = 0;
        this.receiverInput = this.senderInput = ""

        this.$message.success('Transaction created')
      } catch(error) {
        this.$message.error(error)
      } finally {
        this.sendLoading = false
      }
    },
    handleClose(done) {
      this.$emit('close')
      done();
    },
  },
  watch: {
    show() {
      this.sendLoading
        = this.fullscreen
        = false

      this.senderInput
        = this.receiverInput
        = ""
    }
  }
}
</script>

<style scoped>
.content {
  margin: 0 auto;
  width: 400px;
  text-align: center;
  word-break: break-word;
}
.btn {
  display: block;
  margin: 24px auto;
}
.fit-parent {
  width: 100%;
}
.bottom-margin {
  margin-bottom: 12px;
}
.input_label {
  height: 100%;
  line-height: 40px;
  text-align: left;
}
</style>
