### Аналіз репозиторію

Цей репозиторій (`dvankevich/react-redux`) є оновленою версією простого веб-додатка для керування завданнями (Todo List), створеного на базі React з Redux Toolkit для управління станом. Основна функціональність залишилася такою ж: додавання завдань, видалення, позначення як виконані, фільтрація за статусом (всі, активні, виконані) та лічильник завдань. Однак, порівняно з попередньою версією (від 2026-01-01T15:15:56), додані покращення для стійкості та збереження даних:

- **Нові фічі**:
  - Інтеграція `redux-persist` для збереження стану завдань у localStorage. Це означає, що завдання не зникають після перезавантаження сторінки (фільтри не зберігаються, бо в persistConfig whitelist тільки "tasks").
  - Захисний код у кількох місцях: перевірки чи `tasks` є масивом (наприклад, у `tasksSlice.js`, `TaskList.jsx`, `TaskCounter.jsx`). Це запобігає помилкам, якщо стан пошкоджений (наприклад, з localStorage прийшов невалідний тип даних).
- **Технологічний стек**: Той самий — React, Redux Toolkit, CSS Modules, `clsx` для стилів, `react-icons` для іконок, `nanoid` для ID. Додана `redux-persist` як залежність.
- **Структура**: Залишилася ідентичною (38 файлів, включаючи CSS). Головні зміни в `store.js` (персистенція), `main.jsx` (PersistGate), і дрібні в слайсах/компонентах.
- **Функціональність**: Додаток став більш user-friendly завдяки збереженню завдань. Стан завдань персистується автоматично, без ручного коду для localStorage.
- **Плюси**: Чистий, модульний код; тепер з персистенцією — ідеальний для реального використання. Використовує сучасні практики (Redux Toolkit, Vite).
- **Мінуси**: Все ще немає обробки помилок (наприклад, для порожніх завдань), аутентифікації чи API. Дизайн простий. Не використовує TypeScript повноцінно (є dev-залежності, але код на JS).
- **Загальна оцінка**: Навчальний проект, покращений для стійкості. Обсяг коду невеликий, добре організований. Стан на 2026-01-01T15:29:43 — версія 0.0.0, приватний репозиторій на базі Vite шаблону.

Репозиторій демонструє, як додати персистенцію до Redux без складності, роблячи його корисним прикладом для новачків.

### Покрокова інструкція для новачка з написання цього додатку

Ця інструкція допоможе тобі створити цей додаток з нуля. Я припускаю, що ти новачок у React/Redux, тому поясню кожен крок просто: що робити, чому це потрібно і можливі помилки. Ти повинен мати встановлений Node.js (версія 14+), npm (йде з Node) та Git (опціонально). Якщо ні — завантаж з офіційних сайтів. Використовуй редактор коду як VS Code (безкоштовний, з розширеннями для React).

Ми почнемо з створення базового проекту Vite + React, додамо залежності, створимо файли та код крок за кроком. Загальний час: 1-2 години для новачка. Після кожного кроку тестуй додаток командою `npm run dev` (відкриється в браузері на localhost:5173).

#### Крок 1: Створення базового проекту
- **Що робити**:
  1. Відкрий термінал (Command Prompt на Windows, Terminal на macOS/Linux).
  2. Створи папку для проекту: `mkdir my-todo-app` і перейди в неї: `cd my-todo-app`.
  3. Ініціалізуй проект Vite: `npm create vite@latest . -- --template react` (вибери "React" і "JavaScript" якщо запитає).
  4. Встанови залежності: `npm install`.
- **Пояснення**: Vite — швидкий інструмент для React-проектів, кращий за create-react-app. Він створює базову структуру: `src/` для коду, `index.html`, `package.json`. Це "скелет" додатка, де React рендерить UI в `<div id="root">`.
- **Можливі помилки**: Якщо npm не працює, перевір Node.js. Якщо проект не створюється, перевір інтернет.
- **Тест**: Запусти `npm run dev` — побачиш базовий React-логотип.

#### Крок 2: Додавання залежностей
- **Що робити**: У терміналі виконай:
  ```
  npm install @reduxjs/toolkit react-redux redux-persist clsx prop-types react-icons nanoid
  ```
  (Це додасть Redux Toolkit, Redux для React, persist для збереження, clsx для стилів, prop-types для валідації, іконки та nanoid для ID).
- **Пояснення**: Ці бібліотеки потрібні для: Redux (управління станом), persist (збереження в localStorage), clsx (умовні CSS-класи), prop-types (перевірка пропсів у компонентах), react-icons (іконка видалення), nanoid (унікальні ID для завдань). Без них код не працюватиме.
- **Можливі помилки**: Якщо версія не та, перевір `package.json` — залежності повинні відповідати наданому (наприклад, "@reduxjs/toolkit": "^2.2.6").
- **Тест**: Перевір `package.json` — залежності додані.

#### Крок 3: Налаштування Redux (створення стору та слайсів)
- **Що робити**:
  1. Створи папку `src/redux/`.
  2. Створи файл `src/redux/constants.js` і встав код:
     ```javascript
     export const statusFilters = {
       all: 'all',
       active: 'active',
       completed: 'completed',
     };
     ```
  3. Створи `src/redux/tasksSlice.js`:
     ```javascript
     import { createSlice, nanoid } from "@reduxjs/toolkit";

     const tasksSlice = createSlice({
       name: "tasks",
       initialState: [],
       reducers: {
         addTask: {
           reducer(state, action) {
             if (!Array.isArray(state)) {
               return [action.payload];
             }
             state.push(action.payload);
           },
           prepare(text) {
             return {
               payload: {
                 text,
                 id: nanoid(),
                 completed: false,
               },
             };
           },
         },
         deleteTask(state, action) {
           const index = state.findIndex((task) => task.id === action.payload);
           state.splice(index, 1);
         },
         toggleCompleted(state, action) {
           for (const task of state) {
             if (task.id === action.payload) {
               task.completed = !task.completed;
               break;
             }
           }
         },
       },
     });

     export const { addTask, deleteTask, toggleCompleted } = tasksSlice.actions;
     export const tasksReducer = tasksSlice.reducer;
     ```
  4. Створи `src/redux/filtersSlice.js`:
     ```javascript
     import { createSlice } from "@reduxjs/toolkit";
     import { statusFilters } from "./constants";

     const filtersSlice = createSlice({
       name: "filters",
       initialState: {
         status: statusFilters.all,
       },
       reducers: {
         setStatusFilter(state, action) {
           state.status = action.payload;
         },
       },
     });

     export const { setStatusFilter } = filtersSlice.actions;
     export const filtersReducer = filtersSlice.reducer;
     ```
  5. Створи `src/redux/selectors.js`:
     ```javascript
     export const getTasks = (state) => state.tasks;

     export const getStatusFilter = (state) => state.filters.status;
     ```
  6. Створи `src/redux/store.js` (з персистенцією):
     ```javascript
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
     import storage from "redux-persist/lib/storage";
     import { tasksReducer } from "./tasksSlice";
     import { filtersReducer } from "./filtersSlice";

     const rootReducer = combineReducers({
       tasks: tasksReducer,
       filters: filtersReducer,
     });

     const persistConfig = {
       key: "root",
       storage,
       whitelist: ["tasks"],
     };

     const persistedReducer = persistReducer(persistConfig, rootReducer);

     export const store = configureStore({
       reducer: persistedReducer,
       middleware: (getDefaultMiddleware) =>
         getDefaultMiddleware({
           serializableCheck: {
             ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
           },
         }),
     });

     export const persistor = persistStore(store);
     ```
- **Пояснення**: Redux керує глобальним станом (завданнями та фільтрами). Слайси — модулі для логіки (actions/reducers). Селектори — для читання стану. Store — центральне сховище. Persist зберігає tasks у localStorage (whitelist обмежує, щоб фільтри не зберігалися). Захист у tasksSlice запобігає крашам від невалідного стану.
- **Можливі помилки**: Якщо забув імпорт, код не скомпілюється. Тестуй: імпортуй store в консоль (поки не тестуємо).
- **Тест**: Додаток ще не готовий, але помилок компіляції не повинно бути.

#### Крок 4: Створення основних компонентів
- **Що робити**:
  1. Створи папку `src/components/` з підпапками для кожного компонента (наприклад, `AppBar/`, `Button/` тощо).
  2. Створи `src/components/App.jsx`:
     ```javascript
     import { Layout } from './Layout/Layout'; // Створи Layout пізніше, якщо потрібно; поки можеш закоментувати
     import { AppBar } from './AppBar/AppBar';
     import { TaskForm } from './TaskForm/TaskForm';
     import { TaskList } from './TaskList/TaskList';

     export const App = () => {
       return (
         <Layout>
           <AppBar />
           <TaskForm />
           <TaskList />
         </Layout>
       );
     };
     ```
     (Примітка: У наданому коді Layout не є, але згадується. Якщо не потрібно, заміни на <div>).
  3. Створи компоненти по черзі: `AppBar/AppBar.jsx` та `AppBar.module.css`, `Button/Button.jsx` та CSS, `StatusFilter/StatusFilter.jsx` та CSS, `Task/Task.jsx` та CSS (з prop-types), `TaskCounter/TaskCounter.jsx` та CSS (з перевірками), `TaskForm/TaskForm.jsx` та CSS, `TaskList/TaskList.jsx` та CSS (з перевірками).
     - Вставляй код з наданого документа в кожен файл.
     - Наприклад, для Button: JSX з clsx, CSS з класами.
  4. Створи `src/index.css` з базовими стилями.
- **Пояснення**: Компоненти — будівельні блоки UI. Кожен має JSX (структура) та CSS Module (стилі, щоб уникнути конфліктів). UseSelector/useDispatch — хуки для взаємодії з Redux. Prop-types — валідація вхідних даних. Перевірки масиву — для стійкості.
- **Можливі помилки**: Неправильні імпорти (наприклад, забув "../"). Тестуй після кожного: запусти `npm run dev` і перевір консоль.
- **Тест**: Додай тимчасовий текст у App.jsx, щоб побачити зміни.

#### Крок 5: Підключення Redux до React
- **Що робити**: Онови `src/main.jsx`:
  ```javascript
  import React from "react";
  import ReactDOM from "react-dom/client";
  import { Provider } from "react-redux";
  import { App } from "./components/App";
  import { PersistGate } from "redux-persist/integration/react";
  import { store, persistor } from "./redux/store";
  import "./index.css";

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
  ```
- **Пояснення**: Provider робить store доступним для всіх компонентів. PersistGate чекає завантаження з localStorage (loading={null} — без лоадера). Без цього Redux не працюватиме.
- **Можливі помилки**: Якщо persistor не імпортовано, додаток не запуститься.
- **Тест**: Запусти `npm run dev`. Додай завдання в браузері, перезавантаж — вони повинні зберегтися.

#### Крок 6: Тестування та налагодження
- **Що робити**:
  1. Запусти `npm run dev`.
  2. Тестуй: Додай завдання, познач/видали, фільтруй, перевір лічильник. Перезавантаж — завдання залишаються.
  3. Виконай `npm run lint` для перевірки стилю коду.
  4. Якщо помилки — використовуй консоль браузера (F12 > Console) і `console.log` у коді.
- **Пояснення**: Тестування забезпечує, що все працює. Persist додає "магію" збереження, але перевір, чи фільтри скидаються (як задумано).
- **Можливі помилки**: Якщо tasks не масив — код захищений, але додай console.log для дебагу.

#### Крок 7: Збірка та деплой (опціонально)
- **Що робити**: `npm run build` — створить `dist/`. Для деплою: завантаж на Vercel/Netlify (створи репозиторій на GitHub і підключи).
- **Пояснення**: Build оптимізує для продакшну. Preview — тест білду локально.
- **Можливі помилки**: Виправ помилки перед білдом.

#### Додаткові рекомендації
- Вивчай: React docs, Redux Toolkit tutorial.
- Розшир: Додай валідацію форми (не додавати порожні завдання).
- Якщо застряг: Шукай на Stack Overflow або запитай в чатах (r/reactjs).
- Git: Ініціалізуй `git init`, коміть зміни після кожного кроку.

