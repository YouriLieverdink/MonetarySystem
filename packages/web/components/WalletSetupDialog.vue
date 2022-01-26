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
      <el-empty :image="logo" :image-size="192">
        <template #description>
          <span class="title">TRITIUM Network</span>
        </template>
      </el-empty>

      <el-steps :active="active" finish-status="success" align-center>
        <el-step>
          <template #title>
            <span class="step_title">Introduction</span>
          </template>
        </el-step>
        <el-step>
          <template #title>
            <span class="step_title">Wallet setup</span>
          </template>
        </el-step>
      </el-steps>

      <div class="steps_content">
        <div v-show="active === 0">
          short intro blabla
        </div>
        <div v-show="active === 1">
          press generate
        </div>
        <div v-show="active >= 2">
          here's your key: <i class="el-icon-key"/>
          <el-checkbox
            label="I made a backup of the private key"
            v-model="agree"
            class="accept_terms"
            @change="agreed"
          />
        </div>
      </div>
      <el-button
        type="primary"
        v-text="btnText"
        class="next-btn"
        :disabled="btnDisabled"
        @click="next"
      />
    </div>
  </el-dialog>
</template>

<script>
import logo from '@/static/icon.png'

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
      active: 0,
      btnLoading: false,
      agree: false
    }
  },
  methods: {
    next() {
      switch (this.active) {
        case 0:
          this.active = 1
          break
        case 1:
          this.generateWallet()
          break
        case 2:
          this.$emit('close')
      }
    },
    generateWallet() {
      this.btnLoading = true

      // simulate api call
      setTimeout(() => {
        this.btnLoading = false;
        this.active = 2;
      }, 2000)
    },
    agreed(checked) {
      this.agree = checked
    },
    handleClose(done) {
      this.$emit('close')
      done();
    }
  },
  computed: {
    btnDisabled() {
      return (this.active >= 2 && !this.agree) || this.btnLoading
    },
    btnText() {
      return this.active < 2
        ? this.active === 0 ? 'Continue' : 'Generate'
        : 'To the wallet'
    }
  },
  watch: {
    show() {
      this.active = 0
      this.btnLoading = false
      this.agree = false
    }
  }
}
</script>

<style scoped>
.dialog {
  border-radius: 4px;
}
.title {
  /*color: #03a00b;*/
  font-size: 20px;
}
.content {
  margin: 0 auto;
  width: 400px;
}
.next-btn {
  display: block;
  margin: 36px auto 12px auto;
}
.step_title {
  font-size: 14px;
}
.steps_content {
  margin-top: 24px;
  text-align: center;
}
.accept_terms {
  margin-top: 24px;
}
</style>
