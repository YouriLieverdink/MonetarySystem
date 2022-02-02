<template>
  <div class="app">
    <Nuxt />
  </div>
</template>

<script>
export default {
  name: 'default',
};
</script>

<style>
html, body {
  background: #111;
  font-family: monospace;
}
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
.window_header {
  display:flex;
  flex-direction: row
}
.window_title {
  left: 50%;
  transform: translateX(-50%);
  color: #ccc;
  position: absolute;
}
</style>
