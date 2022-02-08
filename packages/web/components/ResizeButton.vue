<template>
  <el-button
    size="mini"
    circle
    id="button"
    class="el-icon-plus"
    :disabled="disabled"
    :style="{ color: hover ? 'black' : 'transparent' }"
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
#button {
  height: 16px;
  width: 16px;
  line-height: 16px;
  text-align: center;
  font-size: 12px;
  font-weight: 100;
  margin: 0;
  padding: 0 0 2px 0;
  background: #00CA4E;
}
</style>
