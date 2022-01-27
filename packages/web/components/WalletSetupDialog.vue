<template>
  <el-dialog
    :visible.sync="show"
    :before-close="handleClose"
    :show-close="false"
    :fullscreen="fullscreen"
    append-to-body>
    <template #title>
      <div>
        <close-button @click="$emit('close')"/>
        <minimize-button disabled/>
        <resize-button @click="fullscreen  = !fullscreen"/>
      </div>
    </template>
    <div class="content">
      <div class="description">
        Generating or importing a private key will not affect your existing keys
      </div>
      <div>
        <el-popover
          placement="bottom"
          width="400"
          height="200"
          trigger="manual"
          v-model="showNewPrivKey">
          <template #default>
            <span style="font-size: 13px">Your new private key has been added to your wallet.</span><br>
            <el-tooltip class="header_item" content="Click to copy" placement="bottom">
              <el-input
                ref="generatedKey"
                readonly
                prefix-icon="el-icon-key"
                :value="generatedPrivateKey"
                type="text"
                size="medium"
                @click.native="copyPrivateKey"
              />
            </el-tooltip>
          </template>

          <el-button
            slot="reference"
            v-text="generateLoading ? 'Generating' : 'Generate'"
            class="btn"
            type="primary"
            icon="el-icon-setting"
            :loading="generateLoading"
            @click="generatePrivateKey"
          />
        </el-popover>
      </div>

      <el-divider class="divider">OR</el-divider>

      <div ref="importKey">
        <el-form @submit.prevent.native="importPrivateKey">
          <el-input
            type="text"
            placeholder="Enter private key here"
            v-model="privateKeyInput" />
          <el-button
            type="primary"
            icon="el-icon-plus"
            class="btn"
            v-text="importLoading ? 'Importing' : 'Import'"
            :loading="importLoading"
            @click="importPrivateKey"
            />
        </el-form>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import logo from '@/static/icon.png'
import { mapActions } from 'vuex'
import { apiRequest } from '@/core/service/apiService';

export default {
  name: 'WalletSetupDialog',
  props: {
    show: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data() {
    return {
      logo,
      privateKeyInput: "",
      generateLoading: false,
      importLoading: false,
      showNewPrivKey: false,
      generatedPrivateKey: "reFAfafadff",
      fullscreen: false
    }
  },
  methods: {
    ...mapActions("wallet", [
      'importAddress'
    ]),
    generatePrivateKey() {
      this.generateLoading = true

      apiRequest.generateKeys()
        .then(address => {
          this.importAddress(address.data.privateKey)
          this.$message({
            message: 'Import successful',
            type: 'success'
          })
        })
        .catch(error => this.$message({
            message: error,
            type: 'error'
          }))
        .finally(() => this.generateLoading = false)
    },
    importPrivateKey() {
      this.importLoading = true

      apiRequest.importPrivateKey(this.privateKeyInput)
        .then(address => {
          this.importAddress(address.data.privateKey)
          this.$message({
            message: 'Import successful',
            type: 'success'
          })
        })
        .catch(error => this.$message({
          message: error,
          type: 'error'
        }))
        .finally(() => this.importLoading = false)
    },
    handleClose(done) {
      this.$emit('close')
      done();
    },
    copyPrivateKey() {
      this.$refs.generatedKey.focus()
      this.$refs.generatedKey.select()
      document.execCommand('copy')
    }
  },
  watch: {
    show() {
      this.generateLoading = false
      this.importLoading = false
      this.privateKeyInput = ""
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
.divider {
  margin: 36px 0;
}
.description {
  margin-bottom: 36px;
}
</style>
