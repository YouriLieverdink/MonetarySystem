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
          v-model="showPrivateKeyOutput"
          placement="bottom"
          width="300"
          height="200"
          trigger="manual">
          <template #default>
            <span class="keyOutput_description">Your new private key has been added to your wallet.</span>
            <el-tooltip class="header_item" content="Click to copy" placement="bottom">
              <el-input
                ref="keyOutput"
                readonly
                prefix-icon="el-icon-key"
                :value="privateKeyOutput"
                type="text"
                size="medium"
                @click.native="copyPrivateKey"
              />
            </el-tooltip>
          </template>

          <el-button
            slot="reference"
            v-text="generateLoading ? ' Generating' : ' Generate'"
            class="btn"
            type="primary"
            :loading="generateLoading"
            @click="generatePrivateKey"
          />
        </el-popover>
      </div>

      <div ref="spacing" :class="[showPrivateKeyOutput ? 'spacing_active' : 'spacing']"></div>
      <el-divider>OR</el-divider>

      <div ref="importKey">
        <el-form @submit.prevent.native="importPrivateKey">
          <el-input
            type="text"
            placeholder="Enter private key here"
            v-model="privateKeyInput" />
          <el-button
            type="primary"
            class="btn"
            v-text="importLoading ? ' Importing' : ' Import'"
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
      privateKeyOutput: "",
      showPrivateKeyOutput: false,
      generateLoading: false,
      importLoading: false,
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
          this.privateKeyOutput = address.data.privateKey
          this.showPrivateKeyOutput = true
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
      this.$refs.keyOutput.focus()
      this.$refs.keyOutput.select()
      document.execCommand('copy')
    }
  },
  watch: {
    show() {
      this.generateLoading
        = this.importLoading
        = this.showPrivateKeyOutput
        = this.fullscreen
        = false

      this.privateKeyInput
        = this.privateKeyOutput
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
.description {
  margin-bottom: 36px;
}
.keyOutput_description {
  font-size: 13px;
  margin: 6px 0 12px;
  display:block;
}
.spacing {
  margin: 36px;
}
.spacing_active {
  height: 108px
}
</style>
