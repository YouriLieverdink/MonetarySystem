<template>
  <el-button
    size="mini"
    circle
    id="button"
    class="el-icon-close"
    :disabled="disabled"
    :style="{ color: hover ? 'black' : 'transparent' }"
    @click="$emit('click')"
    @mouseover.native="hover = true"
    @mouseleave.native="hover = false"
  />
</template>

<script>
export default {
  name: 'CloseButton',
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      hover: false
    }
  }
};
</script>

<style scoped>
#button {
  height: 16px;
  width: 16px;
  line-height: 12px;
  font-size: 12px;
  font-weight: 100;
  margin: 0;
  padding: 2px 0 0 1px;
  background: #ff605c;
}
</style>
