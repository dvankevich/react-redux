Для того щоб додати збереження завдань у `localStorage` за допомогою бібліотеки `redux-persist` у вашому поточному проєкті, вам потрібно виконати кілька кроків.

Нижче наведено детальну інструкцію з налаштування.

---

## 1. Встановлення бібліотеки

Спочатку встановіть саму бібліотеку:

```bash
npm install redux-persist

```

## 2. Налаштування Store (`src/redux/store.js`)

Це основний етап. Нам потрібно створити конфігурацію для `redux-persist`, обернути наш `tasksReducer` і додати спеціальне налаштування для `middleware`, щоб Redux Toolkit не видавав помилок при перевірці на серіалізацію даних (оскільки `redux-persist` використовує несеріалізовані методи всередині).

**Оновлений код `src/redux/store.js`:**

```javascript
import { configureStore } from "@reduxjs/toolkit";
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

// Конфігурація для збереження тільки завдань
const tasksPersistConfig = {
  key: "tasks",
  storage,
  // whitelist: ['tasks'] // Якщо ви обгортаєте rootReducer, тут вказується, що саме зберігати
};

// Огортаємо tasksReducer
const persistedTasksReducer = persistReducer(tasksPersistConfig, tasksReducer);

export const store = configureStore({
  reducer: {
    tasks: persistedTasksReducer,
    filters: filtersReducer, // Фільтри зазвичай не зберігають у localStorage, щоб при оновленні вони скидалися
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ігноруємо екшени redux-persist, щоб не було помилок у консолі
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

```

## 3. Оновлення точки входу (`src/main.jsx`)

Щоб програма чекала на завантаження даних із `localStorage` перед тим, як відрендерити інтерфейс, потрібно використати компонент `PersistGate`.

**Оновлений код `src/main.jsx`:**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Додаємо цей імпорт
import { App } from './components/App';
import { store, persistor } from './redux/store'; // Імпортуємо persistor
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* PersistGate затримує рендер до отримання стану з localStorage */}
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

```

---

## Чому ми зробили саме так? (Аналіз репозиторію)

1. **Селективне збереження:** У вашому проєкті є два слайси: `tasks` та `filters`. Зберігати стан фільтрів у `localStorage` зазвичай є поганою практикою (користувач очікує побачити "Всі" при перезавантаженні сторінки). Тому ми застосували `persistReducer` **тільки до `tasksReducer**`.
2. **Middleware:** Redux Toolkit за замовчуванням вимагає, щоб усі дані в екшенах були "серіалізованими" (простими об'єктами/рядками). `redux-persist` використовує внутрішні функції в екшенах, тому без налаштування `ignoredActions` ви отримаєте багато попереджень у консолі.
3. **Storage:** Ми використали `redux-persist/lib/storage`, що відповідає стандартному веб-браузерному `localStorage`.

### Рекомендації:

* **Очищення даних:** Якщо під час розробки структура даних у `tasksSlice` зміниться (наприклад, ви додасте нове поле до об'єкта task), стара версія даних у `localStorage` може викликати помилки. У такому разі просто очистіть `localStorage` браузера або змініть `key: 'tasks-v2'` у конфігурації.
* **Initial State:** Переконайтеся, що `initialState` у `tasksSlice.js` залишається порожнім масивом `[]`, як він є зараз. `redux-persist` автоматично наповнить його даними після завантаження.
