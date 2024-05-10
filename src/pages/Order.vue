<template>
  <v-container>
    <!-- Информация о выбранной валюте -->
    <div class="currency-info mb-2">
      <h2>Selected Currency: {{ selectedCurrency }}</h2>
    </div>

    <!-- Отображение таблицы Sell Orders -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-center bg-grey-darken-3 rounded-lg">
            Sell Orders
          </v-card-title>
          <v-data-table
            density="compact"
            :items="sellOrders"
            :headers="getTableHeaders"
            :search="searchSell"
            :items-per-page="rowsPerPage"
            :items-per-page-options="PER_PAGE_OPTIONS"
            :class="tableClass"
            fixed-header
            :height="tableHeight"
            @update:items-per-page="updateRowsPerPage"
          ></v-data-table>
        </v-card>
        <!-- Поле поиска -->
        <v-text-field
          v-model="searchSell"
          label="Search Sell Orders"
        ></v-text-field>
      </v-col>
      <!-- Отображение таблицы Buy Orders -->
      <v-col>
        <v-card :class="{ 'mt-n12': !mdAndUp }">
          <v-card-title class="text-center bg-grey-darken-3 rounded-lg">
            Buy Orders
          </v-card-title>
          <v-data-table
            density="compact"
            :headers="getTableHeaders"
            :items="buyOrders"
            :search="searchBuy"
            :items-per-page="rowsPerPage"
            :items-per-page-options="PER_PAGE_OPTIONS"
            :class="tableClass"
            fixed-header
            :height="tableHeight"
            @update:items-per-page="updateRowsPerPage"
          ></v-data-table>
        </v-card>
        <!-- Поле поиска -->
        <v-text-field
          v-model="searchBuy"
          label="Search Buy Orders"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import {TABLE_HEADERS, useCurrencyStore,PER_PAGE_OPTIONS} from '@/stores/order';
import { computed, ref } from 'vue';
import { useDisplay } from 'vuetify';


const store = useCurrencyStore();
// Чек на мобильное устройство
const { mdAndUp } = useDisplay();
// Вычисляемое свойство для высоты таблицы в зависимости от экрана
const tableHeight = computed(() => {
  return mdAndUp.value ? '65vh' : '19vh';
});

// Форматирование выбранной валюты
const selectedCurrency = computed(() => {
  const currency = store.selectedCurrency;
  return currency && currency.length > 3 ? `${currency.slice(0, 3)}/${currency.slice(3)}` : currency;
});

// Реактивное свойство для количества строк на странице
const rowsPerPage = ref(store.rowsPerPage);

// Начальные параметры поиска
const searchSell = ref('');
const searchBuy = ref('');

// Обновление количества строк на странице
function updateRowsPerPage(newVal) {
  rowsPerPage.value = newVal;
  store.setRowsPerPage(newVal);
}

// Формирование заголовков таблицы с учетом Quantity
const getTableHeaders = computed(() => {
  const tableHeaders = [...TABLE_HEADERS];
  if (mdAndUp.value) {
    tableHeaders.push({ title: 'Quantity', value: 'quantity', key: 'quantity' });
  }
  return tableHeaders;
});

// Вычисление классов для таблиц
const tableClass = computed(() => {
  return !mdAndUp.value ? 'hide-xs-only' : '';
});

// Функция для формирования объекта заказа
function formatOrder(order) {
  const price = parseFloat(order[0]).toFixed(2);
  const formattedOrder = { price };
  // Добавляем количество только для больших экранов
  if (mdAndUp.value) {
    formattedOrder.quantity = parseFloat(order[1]);
  }
  // Вычисляем общую стоимость
  formattedOrder.total = (parseFloat(order[0]) * parseFloat(order[1])).toFixed(2);
  return formattedOrder;
}

// Данные для таблицы Sell Orders
const sellOrders = computed(() => {
  if (!store.orderBook.sell || !Array.isArray(store.orderBook.sell)) {
    return [];
  }
  return store.orderBook.sell.map(formatOrder);
});

// Данные для таблицы Buy Orders
const buyOrders = computed(() => {
  if (!store.orderBook.buy || !Array.isArray(store.orderBook.buy)) {
    return [];
  }
  return store.orderBook.buy.map(formatOrder);
});
</script>

