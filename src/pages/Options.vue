<template>
  <v-container>
    <v-select
      v-model="selectedPair"
      :items="PAIRS_OPTIONS"
      label="Select pair"
      class="mx-auto w-sm-50"
    ></v-select>
    <!-- Фиксация изменения пар валют -->
    <div>
      <h3 class="mb-2 text-center">Changelog</h3>
      <ul style="list-style-type: none;">
        <li v-for="log in changeLogs" :key="log.timestamp" class="mb-1 text-center">
          {{ log.message }}
        </li>
      </ul>
    </div>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useCurrencyStore,PAIRS_OPTIONS } from '@/stores/order';


const store = useCurrencyStore();
// Вычисляемое свойство для выбранной валютной пары
const selectedPair = computed({
  get: () => store.selectedCurrency,
  set: (value) => {
    if (store.selectedCurrency !== value) {
      store.logChange(store.selectedCurrency, value);
      store.selectedCurrency = value;
      store.saveSelectedCurrencyToLocalStorage();
      store.fetchOrderBook(value);
      store.subscribeToWebSocket(value);
    }
  }
});
// Вычисляемое свойство для журнала изменений
const changeLogs = computed(() => store.changeLogs);

</script>
