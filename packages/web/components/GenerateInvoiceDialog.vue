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
        <span class="window_title">Generate Invoice</span>
      </div>
    </template>
    <div class="content">
      <el-form @submit.prevent.native="handleGenerateInvoice">
        <el-row class="bottom-margin">
          <el-col :span="8" class="input_label">Destination</el-col>
          <el-col :span="16">
            <el-select
              v-model="receiverInput"
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
          <el-col :span="8" class="input_label">Amount</el-col>
          <el-col :span="16">
            <el-input-number
              v-model="amountInput"
              :min="1"
              class="fit-parent"
            />
          </el-col>
        </el-row>
        <el-button
          type="primary"
          class="btn"
          v-text="'Generate QR'"
          @click="handleGenerateInvoice"
        />
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { apiRequest } from '@/core/service/apiService';

export default {
  name: 'GenerateInvoiceDialog',
  props: {
    show: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data() {
    return {
      amountInput: 0,
      receiverInput: "",
      fullscreen: false
    }
  },
  computed: {
    ...mapState("wallet", {
      addresses: state => state.addresses
    }),
  },
  methods: {
    handleGenerateInvoice() {
      try {
        if (this.receiverInput.length < 50 && this.addresses.find(a => a.publicKey === this.receiverInput) == null)
          throw Error('Please select a receiving address')

        this.$message.info('generate QR') // todo
      } catch (e) {
        this.$message.error(e)
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

      this.amountInput = 0
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
