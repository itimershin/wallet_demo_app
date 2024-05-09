<template>
  <v-app-bar :elevation="10">
    <v-toolbar-title class="text-center flex-grow-1">
      <router-link to="/">
        <v-img
          height="40"
          src="@/assets/logo.svg"
        />
      </router-link>
    </v-toolbar-title>
    <div class="d-flex justify-center flex-grow-1">
      <v-btn variant="outlined" text="Настройки" to="/customization" class="flex-shrink-0"></v-btn>
      <v-btn variant="outlined" text="Order Book" to="/order" class="flex-shrink-0"></v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppHeader'
})
</script>

<style scoped lang="sass">
</style>
