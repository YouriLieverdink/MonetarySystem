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
        <span class="window_title">Add address</span>
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
                autosize
                prefix-icon="el-icon-key"
                :value="privateKeyOutput"
                type="textarea"
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
            @click="handleGenerateAddress"
          />
        </el-popover>
      </div>

      <div ref="spacing" :class="[showPrivateKeyOutput ? 'spacing_active' : 'spacing']"></div>
      <el-divider>OR</el-divider>

      <div ref="importKey">
        <el-form @submit.prevent.native="handleImportAddress">
          <el-input
            type="text"
            placeholder="Enter private key here"
            v-model="privateKeyInput" />
          <el-button
            type="primary"
            class="btn"
            v-text="importLoading ? ' Importing' : ' Import'"
            :loading="importLoading"
            @click="handleImportAddress"
            />
        </el-form>
      </div>
    </div>
  </el-dialog>
</template>

<script>
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
    async handleGenerateAddress() {
      this.generateLoading = true

      try {
        const res = await apiRequest.addresses.generate()
        this.importAddress(res.data)
        this.privateKeyOutput = res.data.privateKey
        this.showPrivateKeyOutput = true
        this.$message({
          message: 'Added generated key to wallet',
          type: 'success'
        })
      } catch(error) {
          this.$message({
            message: error,
            type: 'error'
          })
      } finally {
        this.generateLoading = false
      }
    },
    async handleImportAddress() {
      this.importLoading = true

      try {
        if (this.privateKeyInput.length < 40)
          throw new Error("Please enter a valid private key")
        const privKey = this.privateKeyInput
        const res = await apiRequest.addresses.import([privKey])
        this.importAddress({
          publicKey: res.data,
          privateKey: privKey,
          isDefault: false
        })
        this.privateKeyInput = ""
        this.$message({
          message: 'Import successful',
          type: 'success'
        })
      } catch(error) {
        const already_exists = error.response.data.includes('UNIQUE')
        this.$message({
          message: already_exists ? 'Key already imported' : error,
          type: already_exists ? 'warning' : 'error'
        })
      } finally {
        this.importLoading = false
      }
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
  height: 148px
}
</style>
