<script lang="ts">
import Vue from "vue";

export default Vue.mixin({
  methods: {
    shortenKeyString(key: string, length = 12) {
      return key;
      // if (key == null) return ''
      // const k = key.toString()
      // return k.substring(0, (length / 2) - 1)
      //   .concat("……")
      //   .concat(k.substring(k.length - (length / 2), k.length))
    },
  },
});
</script>
