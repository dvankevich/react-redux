**Middleware** у Redux — це проміжний шар логіки, який знаходиться між моментом відправлення екшену (`dispatch`) та моментом, коли цей екшен потрапляє в редюсер.

У вашому проєкті ви вже використовуєте стандартний Middleware, який надає Redux Toolkit через `configureStore`, але розуміння того, як він працює, допоможе вам краще керувати складними процесами.

---

## Як працює Middleware?

Уявіть це як конвеєр. Коли ви викликаєте `dispatch(addTask("New Task"))`:

1. **Action** створюється.
2. Він проходить через ланцюжок **Middleware**.
3. Кожен Middleware може:
* Проігнорувати екшен і передати його далі.
* Змінити екшен.
* Зупинити екшен (він не дійде до редюсера).
* Запустити побічний ефект (запит на сервер, запис у лог).


4. **Reducer** отримує екшен і оновлює стан.

### Схема роботи в коді

Коли ви налаштовуєте `store.js`, ви можете додавати свої Middleware або модифікувати стандартні:

```javascript
// Приклад з вашого майбутнього налаштування для redux-persist
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      // Це Middleware, який перевіряє, чи не передаєте ви функції або складні об'єкти в стейт
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),

```

---

## Де варто використовувати Middleware?

Middleware ідеально підходить для задач, які не є частиною "чистої" логіки оновлення стану (редюсерів).

### 1. Асинхронні операції (API)

Це найчастіший варіант. Хоча у вашому поточному коді завдання додаються синхронно локально, для роботи з сервером використовується `redux-thunk` (який вже вбудований у Redux Toolkit).

* **Приклад:** Ви відправляєте екшен `fetchTasks`, Middleware перехоплює його, робить запит до API, чекає відповідь і лише потім відправляє результат у редюсер.

### 2. Логування та аналітика

Якщо вам потрібно відстежувати дії користувачів.

* **Приклад:** Middleware може автоматично відправляти назву кожного екшену, наприклад `tasks/addTask`, у сервіс аналітики (Google Analytics тощо).

### 3. Збереження даних (Persistence)

Саме так працює `redux-persist`.

* **Приклад:** Щоразу, коли стан змінюється (наприклад, видалено завдання через `deleteTask`), Middleware "підслуховує" цю зміну і автоматично перезаписує масив у `localStorage`.

### 4. Валідація та перевірка прав

Ви можете перевірити, чи має користувач право виконувати певну дію перед тим, як вона змінить дані.

* **Приклад:** Якщо користувач не авторизований, Middleware може заблокувати екшен `toggleCompleted`.

---

## Middleware у вашому репозиторії

У вашому поточному коді Middleware допомагає підтримувати чистоту:

* Ви використовуєте функцію `nanoid()` у `prepare` всередині `tasksSlice.js`. Це гарантує, що редюсер залишається "чистим" (отримує вже готовий ID), а вся логіка підготовки даних винесена за його межі.
* При додаванні `redux-persist`, Middleware візьме на себе складну задачу синхронізації вашого масиву завдань `initialState: []` з пам'яттю браузера.

Чудово! Створення власного **Middleware** допоможе вам "заглянути під капот" Redux і зрозуміти, як проходять екшени через систему.

Ми створимо `loggerMiddleware`, який буде вимірювати час, витрачений на обробку кожного екшену (наприклад, додавання завдання `addTask`), і виводити поточний стан сховища до і після зміни.

---

### 1. Структура Middleware (The Triple Curry)

Middleware має специфічний синтаксис — це три вкладені функції. У Redux Toolkit це виглядає так:

```javascript
const myMiddleware = (store) => (next) => (action) => {
  // 1. Код тут виконується ДО того, як екшен потрапить у редюсер
  const result = next(action); // Передаємо екшен далі
  // 2. Код тут виконується ПІСЛЯ того, як редюсер оновив стан
  return result;
};

```

* **`store`**: надає доступ до методів `getState()` та `dispatch()`.
* **`next`**: функція, яку треба викликати, щоб передати екшен наступному Middleware або в редюсер. Якщо її не викликати, екшен "застрягне" і стан не оновиться.
* **`action`**: об'єкт екшену, який було відправлено (наприклад, `{ type: "tasks/addTask", payload: "..." }`).

---

### 2. Реалізація Logger Middleware у вашому проєкті

Давайте оновимо ваш файл `src/redux/store.js`, додавши туди наш логер.

```javascript
import { configureStore } from "@reduxjs/toolkit";
import { tasksReducer } from "./tasksSlice";
import { filtersReducer } from "./filtersSlice";

// Створюємо наш Middleware
const loggerMiddleware = (store) => (next) => (action) => {
  console.group(action.type); // Групуємо лог за типом екшену
  console.time("Execution time"); // Починаємо відлік часу

  console.log("Prev state:", store.getState());
  console.log("Action:", action);

  // Передаємо екшен далі (у редюсер)
  const result = next(action);

  console.log("Next state:", store.getState());
  console.timeEnd("Execution time"); // Завершуємо відлік
  console.groupEnd();

  return result;
};

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    filters: filtersReducer,
  },
  // Додаємо наш Middleware до стандартних
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
});

```

---

### 3. Що станеться, коли ви додасте завдання?

Коли ви введете текст у `TaskForm` і натиснете кнопку "Add task", у консолі браузера ви побачите:

1. **Тип екшену**: `tasks/addTask`.
2. **Prev state**: стан до додавання (наприклад, масив `tasks` був порожнім `[]`).
3. **Action**: об'єкт із вашим текстом та автоматично згенерованим `id` через `nanoid`.
4. **Next state**: оновлений стан, де вже є нове завдання.
5. **Execution time**: час у мілісекундах (наприклад, `0.15ms`), який знадобився JavaScript для обробки цієї зміни.

---

### Чому це корисно?

* **Налагодження (Debugging)**: Ви бачите, які саме дані приходять в екшені. Це корисно, якщо ви випадково передали `undefined` замість тексту завдання в `tasksSlice`.
* **Оптимізація**: Якщо ви помітите, що `Execution time` занадто великий для простого видалення завдання (`deleteTask`), це сигнал перевірити логіку в редюсері.
* **Контроль побічних ефектів**: Ви можете додати умову: якщо `action.type === 'tasks/deleteTask'`, виводити в консоль підтвердження "Завдання видалено успішно".

Чи хотіли б ви тепер об'єднати цей Middleware з налаштуваннями `redux-persist`, про які ми говорили раніше, щоб бачити, як дані зберігаються в `localStorage`?

Це фінальний етап налаштування. Ми об’єднаємо функціональність **redux-persist** для збереження ваших завдань у `localStorage` та наш власний **Middleware** для відстеження того, як саме ці дані туди потрапляють.

Нижче наведено повний код для основних файлів вашого репозиторію.

---

## 1. Оновлення Store (`src/redux/store.js`)

У цьому файлі ми імпортуємо необхідні інструменти для персистенції, створюємо конфігурацію, обгортаємо редюсер завдань та інтегруємо наш логер.

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
import storage from "redux-persist/lib/storage"; // Використовує localStorage
import { tasksReducer } from "./tasksSlice";
import { filtersReducer } from "./filtersSlice";

// 1. Створюємо наш Logger Middleware
const loggerMiddleware = (store) => (next) => (action) => {
  console.group(`Action: ${action.type}`);
  console.log("Prev state:", store.getState());
  const result = next(action);
  console.log("Next state:", store.getState());
  console.groupEnd();
  return result;
};

// 2. Налаштування збереження (тільки для завдань)
const tasksPersistConfig = {
  key: "tasks",
  storage,
};

// Створюємо персист-редюсер для завдань
const persistedTasksReducer = persistReducer(tasksPersistConfig, tasksReducer);

export const store = configureStore({
  reducer: {
    tasks: persistedTasksReducer, // Тепер цей редюсер автоматично синхронізується з localStorage
    filters: filtersReducer,      // Фільтри не зберігаємо
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ігноруємо системні екшени redux-persist для уникнення помилок серіалізації
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(loggerMiddleware), // Додаємо наш логер у ланцюжок
});

export const persistor = persistStore(store);

```

---

## 2. Оновлення точки входу (`src/main.jsx`)

Щоб програма чекала на відновлення даних із `localStorage` перед першим рендером, використовуємо `PersistGate`.

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { App } from './components/App';
import { store, persistor } from './redux/store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      {/*loading={null} означає, що ми нічого не показуємо під час завантаження даних із пам'яті*/}
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

```

---

## Що ви побачите в консолі завдяки Middleware?

Тепер при кожній дії ви зможете спостерігати за життєвим циклом даних:

1. **При завантаженні сторінки**: Middleware зафіксує екшен `persist/REHYDRATE`. У його `payload` ви побачите дані, які були зчитані з `localStorage`.
2. **При додаванні завдання (`addTask`)**:
* **Prev state**: `tasks: []`.
* **Next state**: `tasks: [{id: "...", text: "...", completed: false}]`.


3. **Перевірка в DevTools**: Якщо ви відкриєте вкладку **Application -> Local Storage**, ви побачите там ключ `persist:tasks` із вашим масивом у форматі JSON.

### Чому ми поставили логер в кінці?

Використання `.concat(loggerMiddleware)` гарантує, що ваш логер буде викликаний останнім у ланцюжку Middleware. Це важливо, бо ми хочемо бачити стан саме після того, як відпрацювали всі вбудовані трансформації та логіка збереження.

