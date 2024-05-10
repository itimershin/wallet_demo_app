<template>
  <v-app-bar :elevation="10">
    <v-toolbar-title class="flex-grow-1">
      <router-link to="/">
        <v-img
          height="40"
          src="@/assets/logo.svg"
        />
      </router-link>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="d-flex justify-end align-center flex-grow-1">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" text="options" to="/options" class="mr-4"></v-btn>
      <v-btn variant="outlined" text="Order Book" to="/order"></v-btn>
      <v-spacer></v-spacer>
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
