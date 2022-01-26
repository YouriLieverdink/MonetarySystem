<template>
  <el-dialog
    class="dialog"
    :visible.sync="show"
    :before-close="handleClose"
    :show-close="false"
    append-to-body>
    <template #title>
      <el-button size="mini" circle style="background: #ff605c" @click="$emit('close')"/>
    </template>
    <div class="content">
      <div class="description">
        Generating or importing a private key will not affect your existing keys
      </div>
<!--      here's your key: <i class="el-icon-key"/>-->
<!--      <el-checkbox-->
<!--        label="I have a backup of the private key"-->
<!--        v-model="agree"-->
<!--        class="accept_terms"-->
<!--        @change="agreed"-->
<!--      />-->

      <div ref="generateKey">
        <el-button
          type="primary"
          icon="el-icon-setting"
          :loading="generateLoading"
          @click="generateWallet"
          class="btn">
          {{ generateLoading ? 'Generating' : 'Generate' }}
        </el-button>
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
            :loading="importLoading"
            @click="importPrivateKey"
            class="btn">
            {{ importLoading ? 'Importing' : 'Import' }}
          </el-button>
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
      importLoading: false
    }
  },
  methods: {
    ...mapActions("wallet", [
      'importAddress'
    ]),
    generateWallet() {
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
.dialog {
  border-radius: 4px;
}
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
