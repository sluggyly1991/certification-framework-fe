<template>
  <router-view />
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'App',

  computed: {
    ...mapState({
      needsReload: (state) => state.userSettings.needsReload
    })
  },

  watch: {
    async needsReload(value) {
      if (value === true) {
        await this.$store.dispatch('userSettings/load')

        // Reset
        this.$store.commit('userSettings/setNeedsReload', false)
      }
    }
  },

  async mounted() {
    // Settings beim App-Start laden, falls noch nicht geschehen
    if (!this.$store.state.userSettings.loaded) {
      await this.$store.dispatch('userSettings/load')
    }
  }
}
</script>
