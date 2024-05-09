// currencyPairModule.js
import { defineStore } from 'pinia';

// Определение хранилища Pinia для работы с валютными парами
export const useCurrencyPairStore = defineStore('currencyPair', () => {
  // Состояние хранилища
  const state = {
    currentPair: 'BTCUSDT', // Текущая валютная пара
    orderBook: {}, // Книга заказов
    changeLogs: [], // Журнал изменений
    rowsPerPage: 100, // Количество строк на странице
    websocket: null // WebSocket для обновления данных в реальном времени
  };

  // Мутации для изменения состояния
  const mutations = {
    // Установка текущей валютной пары
    setCurrentPair(newValue) {
      state.currentPair = newValue;
    },
    // Обновление книги заказов на основе полученных данных
    updateOrderBook(data) {
      // Обновление asks
      if (data.a && data.a.length) {
        state.orderBook.asks = [...state.orderBook.asks || [], ...data.a].slice(-state.rowsPerPage);
      }
      // Обновление bids
      if (data.b && data.b.length) {
        state.orderBook.bids = [...state.orderBook.bids || [], ...data.b].slice(-state.rowsPerPage);
      }
    },
    // Логирование изменения текущей валютной пары
    logChange(oldValue, newValue) {
      const now = new Date().toLocaleString();
      const newLog = {
        message: `Валютная пара изменена с ${oldValue} на ${newValue} в ${now}`,
        timestamp: Date.now()
      };
      state.changeLogs.push(newLog);
      saveLogsToLocalStorage();
    },
    // Установка количества строк на странице
    setRowsPerPage(newValue) {
      state.rowsPerPage = newValue;
    },
    // Сохранение текущей валютной пары в локальное хранилище
    saveCurrentPairToLocalStorage() {
      localStorage.setItem('currentPair', state.currentPair);
    },
    // Загрузка текущей валютной пары из локального хранилища
    loadCurrentPairFromLocalStorage() {
      const savedPair = localStorage.getItem('currentPair');
      if (savedPair) {
        state.currentPair = savedPair;
      }
    }
  };

  // Функция для сохранения логов в локальное хранилище
  function saveLogsToLocalStorage() {
    localStorage.setItem('changeLogs', JSON.stringify(state.changeLogs));
  }

  // Функция для подписки на обновления через WebSocket
  function subscribeToWebSocket(pair) {
    if (state.websocket) {
      state.websocket.close();
    }
    state.websocket = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@depth`);
    state.websocket.onmessage = (event) => {
      const depthUpdate = JSON.parse(event.data);
      mutations.updateOrderBook(depthUpdate);
    };
    state.websocket.onerror = (event) => {
      console.error('WebSocket Error:', event);
    };
  }

  // Функция для получения данных о книге заказов по валютной паре
  function fetchOrderBook(pair) {
    const url = `https://api.binance.com/api/v3/depth?symbol=${pair}&limit=5`;
    fetch(url)
      .then(response => response.json())
      .then(data => mutations.updateOrderBook(data))
      .catch(error => console.error('Error fetching order book:', error));
  }

  // Функция для загрузки логов из локального хранилища
  function loadLogsFromLocalStorage() {
    const savedLogs = localStorage.getItem('changeLogs');
    if (savedLogs) {
      state.changeLogs = JSON.parse(savedLogs);
    }
  }

  // Инициализация: загрузка логов, загрузка текущей валютной пары, загрузка данных книги заказов и подписка на обновления WebSocket
  loadLogsFromLocalStorage();
  mutations.loadCurrentPairFromLocalStorage();
  fetchOrderBook(state.currentPair);
  subscribeToWebSocket(state.currentPair);

  // Возвращаем состояние, методы и данные для работы с хранилищем
  return { ...state, fetchOrderBook, subscribeToWebSocket };
});
