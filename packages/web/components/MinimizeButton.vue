<template>
  <el-button
    size="mini"
    circle
    class="el-icon-minus"
    :disabled="disabled"
    :style="{
      height: '16px',
      width: '16px',
      margin: 0,
      padding: 0,
      background: '#FFBD44',
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
  name: 'MinimizeButton',
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
