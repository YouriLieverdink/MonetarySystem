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

      <el-card v-show="generatedQR" class="qr_wrapper">
        <canvas ref="qr" />
      </el-card>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import QR from 'qrcode'

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
      fullscreen: false,
      generatedQR: false
    }
  },
  computed: {
    ...mapState("wallet", {
      addresses: state => state.addresses
    }),
  },
  mounted() {
    this.receiverInput = this.addresses[0]?.publicKey ?? ""
  },
  methods: {
    handleGenerateInvoice() {
        if (this.receiverInput.length > 50
          && this.addresses.find(a => a.publicKey === this.receiverInput) != null
          && this.amountInput > 0) {

          this.generatedQR = true
          QR.toCanvas(this.$refs.qr, JSON.stringify({
            receiver: this.receiverInput,
            amount: this.amountInput
          }))
        }
    },
    handleClose(done) {
      this.$emit('close')
      done();
    },
  },
  watch: {
    show() {
      this.amountInput = 0
      this.fullscreen = false
    },
    receiverInput() {
      this.handleGenerateInvoice()
    },
    amountInput() {
      this.handleGenerateInvoice()
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
.qr_wrapper {
  background:white;
  width: fit-content;
  margin: 36px auto 0;
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
