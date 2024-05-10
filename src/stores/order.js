import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Захардкоженные константы, - доступные пары валют, количество строк на странице, заголовки таблиц.
 *
 */

export const PAIRS_OPTIONS = [
  { title: 'BTC/USDT', value: 'BTCUSDT' },
  { title: 'BNB/BTC', value: 'BNBBTC' },
  { title: 'ETH/BTC', value: 'ETHBTC' }
];
export const PER_PAGE_OPTIONS =  [
  { title: '100', value: 100 },
  { title: '500', value: 500 },
  { title: '1000', value: 1000 }
];
export const TABLE_HEADERS = [
  { title: 'Price', value: 'price', key: 'price' },
  { title: 'Total', value: 'total', key: 'total' }
];

// Определение хранилища
export const useCurrencyStore = defineStore('currency', () => {
  // Реактивные переменные для хранения выбранной валюты, заказа истории изменений и количества строк на странице
  const selectedCurrency = ref('BTCUSDT');
  const orderBook = ref({});
  const changeLogs = ref([]);
  const rowsPerPage = ref(100);


  // Функция получения биржевого стакана
  let websocket = null;
  async function fetchOrderBook(currencyPair) {
    try {
      const url = `https://api.binance.com/api/v3/depth?symbol=${currencyPair}&limit=5`;
      const response = await fetch(url);
      const data = await response.json();
      updateOrderBook(data);
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  }

  // Функция для подписки на WebSocket для получения обновлений
  async function subscribeToWebSocket(currencyPair) {
    try {
      if (websocket) {
        websocket.close();
      }
      websocket = new WebSocket(`wss://stream.binance.com:9443/ws/${currencyPair.toLowerCase()}@depth`);
      websocket.onmessage = async (event) => {
        const depthUpdate = JSON.parse(event.data);
        await updateOrderBook(depthUpdate);
      };
      websocket.onerror = (event) => {
        console.error('WebSocket Error:', event);
      };
    } catch (error) {
      console.error('Error subscribing to WebSocket:', error);
    }
  }
  // Функция для обновления данных
  async function updateOrderBook(data) {
    orderBook.value.sell = (data.a && data.a.length) ? [...(orderBook.value.sell ?? []), ...data.a].slice(-rowsPerPage.value).reverse() : orderBook.value.sell;
    orderBook.value.buy = (data.b && data.b.length) ? [...(orderBook.value.buy ?? []), ...data.b].slice(-rowsPerPage.value).reverse() : orderBook.value.buy;
  }

  // Функция для изменения количества строк на странице
  function setRowsPerPage(newValue) {
    rowsPerPage.value = newValue;
  }

  // Функция для записи изменения в историю изменений
  function logChange(oldValue, newValue) {
    const now = new Date().toLocaleString();
    const newLog = {
      message: `Currency pair changed from ${oldValue} to ${newValue} at ${now}`,
      timestamp: Date.now()
    };
    changeLogs.value.push(newLog);
    saveLogsToLocalStorage();
  }

  // Функция для сохранения истории изменений в локальное хранилище
  function saveLogsToLocalStorage() {
    localStorage.setItem('changeLogs', JSON.stringify(changeLogs.value));
  }
  // Функция для загрузки истории изменений из локального хранилища
  function loadLogsFromLocalStorage() {
    const savedLogs = localStorage.getItem('changeLogs');
    if (savedLogs) {
      changeLogs.value = JSON.parse(savedLogs);
    }
  }

  // Функция для сохранения выбранной валюты в локальное хранилище
  function saveSelectedCurrencyToLocalStorage() {
    localStorage.setItem('selectedCurrency', selectedCurrency.value);
  }

  // Функция для загрузки выбранной валюты из локального хранилища
  function loadSelectedCurrencyFromLocalStorage() {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      selectedCurrency.value = savedCurrency;
    }
  }
  // Загрузка истории изменений и выбранной валюты из локального хранилища
  loadLogsFromLocalStorage();
  loadSelectedCurrencyFromLocalStorage();
  fetchOrderBook(selectedCurrency.value);
  subscribeToWebSocket(selectedCurrency.value);

  // Возврат всех переменных и функций
  return {
    selectedCurrency,
    orderBook,
    changeLogs,
    fetchOrderBook,
    subscribeToWebSocket,
    logChange,
    saveSelectedCurrencyToLocalStorage,
    rowsPerPage,
    setRowsPerPage
  };
});
