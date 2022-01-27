<template>
  <el-button
    size="mini"
    circle
    class="el-icon-plus"
    :disabled="disabled"
    :style="{
      height: '16px',
      width: '16px',
      margin: 0,
      padding: 0,
      background: '#00CA4E',
      lineHeight:'16px',
      color: hover ? 'black' : 'transparent'
    }"
    @click="$emit('click')"
    @mouseover.native="hover = true"
    @mouseleave.native="hover = false"
  />
</template>

<script>
export default {
  name: 'ResizeButton',
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

</style>
