<template>
  <div class="app">
    <Nuxt />
  </div>
</template>

<script>
import 'element-theme-dark';

export default {
  name: 'default',
};
</script>

<style scoped>
.app {
  height: fit-content;
  width: 75%;
  max-width: 1000px;
  min-width: 500px;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
