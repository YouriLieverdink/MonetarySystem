<template>
  <el-card shadow="always" class="wallet_setup">
    <template #header>
      <span class="title">Welcome to TRITIUM</span>
    </template>

    <div class="content">
      <el-empty description="tritium logo here" />

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
            label="I accept the Terms and Agreements"
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
  </el-card>
</template>

<script>

export default {
  name: 'WalletSetup',
  data() {
    return {
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
          this.$router.push('wallet')
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
  }
}
</script>

<style scoped>
.wallet_setup {
  height: 100%;
  overflow-y: scroll;
  background: #333;
}
.title {
  color: #03a00b;
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
