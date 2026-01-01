import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // Використовує localStorage за замовчуванням
import { tasksReducer } from "./tasksSlice";
import { filtersReducer } from "./filtersSlice";

// 1. Об'єднуємо всі редюсери в один rootReducer
const rootReducer = combineReducers({
  tasks: tasksReducer,
  filters: filtersReducer,
});

// 2. Налаштовуємо персистенцію для всього стору, але зберігаємо ТІЛЬКИ завдання
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["tasks"], // Зберігати тільки поле 'tasks'
};

// Огортаємо tasksReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // Тепер редюсер один, і він персистентний
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
