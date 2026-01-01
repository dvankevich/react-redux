### Етап 1: Базовий React — компоненти без Redux

На цьому етапі ми створюємо простий Todo List, де стан завдань зберігається локально в `App.jsx` за допомогою `useState`. Фільтри та лічильник теж реалізовані локально. Це дозволяє побачити базовий React без глобального стану. Я адаптував код з репозиторію, видаливши Redux-частини (наприклад, useSelector/useDispatch), і додав локальний стан. Залежності: тільки React, clsx, prop-types, react-icons (встанови: `npm install clsx prop-types react-icons`).

#### Основні файли:
- **src/components/App.jsx** (кореневий компонент з локальним станом):
  ```jsx
  import { useState } from 'react';
  import { AppBar } from './AppBar/AppBar';
  import { TaskForm } from './TaskForm/TaskForm';
  import { TaskList } from './TaskList/TaskList';
  // import { Layout } from './Layout/Layout'; // Якщо є, або заміни на <div>

  export const App = () => {
    const [tasks, setTasks] = useState([]); // Локальний стан завдань
    const [filter, setFilter] = useState('all'); // Локальний фільтр

    const addTask = (text) => {
      const newTask = { id: Date.now(), text, completed: false }; // Простий ID
      setTasks([...tasks, newTask]);
    };

    const deleteTask = (id) => {
      setTasks(tasks.filter((task) => task.id !== id));
    };

    const toggleCompleted = (id) => {
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    };

    const handleFilterChange = (newFilter) => {
      setFilter(newFilter);
    };

    const getVisibleTasks = () => {
      switch (filter) {
        case 'active':
          return tasks.filter((task) => !task.completed);
        case 'completed':
          return tasks.filter((task) => task.completed);
        default:
          return tasks;
      }
    };

    const count = tasks.reduce(
      (acc, task) => {
        if (task.completed) acc.completed += 1;
        else acc.active += 1;
        return acc;
      },
      { active: 0, completed: 0 }
    );

    return (
      <div> {/* Замість Layout, якщо немає */}
        <AppBar
          filter={filter}
          onFilterChange={handleFilterChange}
          count={count}
        />
        <TaskForm onAdd={addTask} />
        <TaskList
          tasks={getVisibleTasks()}
          onDelete={deleteTask}
          onToggle={toggleCompleted}
        />
      </div>
    );
  };
  ```

- **src/components/TaskForm/TaskForm.jsx** (форма, передає текст через пропс):
  ```jsx
  import { Button } from "../Button/Button";
  import css from "./TaskForm.module.css";

  export const TaskForm = ({ onAdd }) => {
    const handleSubmit = (event) => {
      event.preventDefault();
      const text = event.target.elements.text.value.trim();
      if (text) onAdd(text);
      event.target.reset();
    };

    return (
      <form className={css.form} onSubmit={handleSubmit}>
        <input
          className={css.field}
          type="text"
          name="text"
          placeholder="Enter task text..."
        />
        <Button type="submit">Add task</Button>
      </form>
    );
  };
  ```

- **src/components/TaskList/TaskList.jsx** (список, отримує tasks через пропс):
  ```jsx
  import { Task } from "../Task/Task";
  import css from "./TaskList.module.css";

  export const TaskList = ({ tasks, onDelete, onToggle }) => {
    return (
      <ul className={css.list}>
        {tasks.map((task) => (
          <li className={css.listItem} key={task.id}>
            <Task task={task} onDelete={onDelete} onToggle={onToggle} />
          </li>
        ))}
      </ul>
    );
  };
  ```

- **src/components/Task/Task.jsx** (елемент завдання, без dispatch):
  ```jsx
  import { MdClose } from "react-icons/md";
  import css from "./Task.module.css";
  import PropTypes from "prop-types";

  export const Task = ({ task, onDelete, onToggle }) => {
    return (
      <div className={css.wrapper}>
        <input
          type="checkbox"
          className={css.checkbox}
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <p className={css.text}>{task.text}</p>
        <button className={css.btn} onClick={() => onDelete(task.id)}>
          <MdClose size={24} />
        </button>
      </div>
    );
  };

  Task.propTypes = {
    task: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
  };
  ```

- **src/components/AppBar/AppBar.jsx** (з локальними пропсами для фільтрів і лічильника):
  ```jsx
  import { StatusFilter } from '../StatusFilter/StatusFilter';
  import { TaskCounter } from '../TaskCounter/TaskCounter';
  import css from './AppBar.module.css';

  export const AppBar = ({ filter, onFilterChange, count }) => {
    return (
      <header className={css.wrapper}>
        <section className={css.section}>
          <h2 className={css.title}>Tasks</h2>
          <TaskCounter count={count} />
        </section>
        <section className={css.section}>
          <h2 className={css.title}>Filter by status</h2>
          <StatusFilter filter={filter} onFilterChange={onFilterChange} />
        </section>
      </header>
    );
  };
  ```

- **src/components/StatusFilter/StatusFilter.jsx** (локальні пропси):
  ```jsx
  import { Button } from "../Button/Button";
  import css from "./StatusFilter.module.css";

  export const StatusFilter = ({ filter, onFilterChange }) => {
    return (
      <div className={css.wrapper}>
        <Button selected={filter === 'all'} onClick={() => onFilterChange('all')}>All</Button>
        <Button selected={filter === 'active'} onClick={() => onFilterChange('active')}>Active</Button>
        <Button selected={filter === 'completed'} onClick={() => onFilterChange('completed')}>Completed</Button>
      </div>
    );
  };
  ```

- **src/components/TaskCounter/TaskCounter.jsx** (з пропсами):
  ```jsx
  import css from "./TaskCounter.module.css";

  export const TaskCounter = ({ count }) => {
    return (
      <div>
        <p className={css.text}>Active: {count.active}</p>
        <p className={css.text}>Completed: {count.completed}</p>
      </div>
    );
  };
  ```

- **src/main.jsx** (базовий):
  ```jsx
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import { App } from './components/App';
  import './index.css';

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  ```

- Додай CSS-файли з репозиторію (наприклад, AppBar.module.css тощо) — вони ідентичні.
- **Тест**: Запусти `npm run dev`. Додай завдання — вони відображаються, але зникають при перезавантаженні.

### Етап 2: Додати Redux без персистенції

Тепер додаємо Redux Toolkit для глобального стану. Встанови: `npm install @reduxjs/toolkit react-redux nanoid`. Адаптуємо код з репозиторію: створюємо слайси, селектори, store. Компоненти тепер використовують `useSelector` і `useDispatch` замість пропсів.

#### Нові/оновлені файли:
- **src/redux/constants.js** (з репозиторію):
  ```javascript
  export const statusFilters = {
    all: 'all',
    active: 'active',
    completed: 'completed',
  };
  ```

- **src/redux/tasksSlice.js** (спрощена версія без перевірок):
  ```javascript
  import { createSlice, nanoid } from "@reduxjs/toolkit";

  const tasksSlice = createSlice({
    name: "tasks",
    initialState: [],
    reducers: {
      addTask: {
        reducer(state, action) {
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

- **src/redux/filtersSlice.js** (з репозиторію):
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

- **src/redux/selectors.js** (з репозиторію):
  ```javascript
  export const getTasks = (state) => state.tasks;

  export const getStatusFilter = (state) => state.filters.status;
  ```

- **src/redux/store.js** (проста версія без persist):
  ```javascript
  import { configureStore } from "@reduxjs/toolkit";
  import { tasksReducer } from "./tasksSlice";
  import { filtersReducer } from "./filtersSlice";

  export const store = configureStore({
    reducer: {
      tasks: tasksReducer,
      filters: filtersReducer,
    },
  });
  ```

- **src/components/App.jsx** (видаляємо локальний стан, просто рендеримо компоненти):
  ```jsx
  // Той самий, як у репозиторію: рендерить AppBar, TaskForm, TaskList без пропсів.
  import { AppBar } from './AppBar/AppBar';
  import { TaskForm } from './TaskForm/TaskForm';
  import { TaskList } from './TaskList/TaskList';

  export const App = () => {
    return (
      <div> {/* Або Layout */}
        <AppBar />
        <TaskForm />
        <TaskList />
      </div>
    );
  };
  ```

- **Онови компоненти з Redux**:
  - **TaskForm.jsx**: Додай `useDispatch` і `dispatch(addTask(text))` (як у репозиторію).
  - **TaskList.jsx**: Додай `useSelector(getTasks)`, `useSelector(getStatusFilter)`, `getVisibleTasks` (як у репозиторію, без перевірок).
  - **Task.jsx**: Додай `useDispatch`, `dispatch(deleteTask/toggleCompleted)` (як у репозиторію).
  - **StatusFilter.jsx**: Додай `useSelector(getStatusFilter)`, `useDispatch`, `dispatch(setStatusFilter)` (як у репозиторію).
  - **TaskCounter.jsx**: Додай `useSelector(getTasks)`, reduce для count (як у репозиторію, без перевірок).

- **src/main.jsx** (додай Provider):
  ```jsx
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import { Provider } from 'react-redux';
  import { App } from './components/App';
  import { store } from './redux/store';
  import './index.css';

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
  ```

- **Тест**: Завдання додаються через Redux, але зникають при перезавантаженні.

### Етап 3: Додати персистенцію

Встанови: `npm install redux-persist`. Онови для збереження tasks у localStorage. Додаємо перевірки з репозиторію для стійкості.

#### Оновлені файли:
- **src/redux/store.js** (з persist, як у репозиторію):
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
    whitelist: ["tasks"], // Тільки tasks зберігаються
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

- **src/redux/tasksSlice.js** (додай перевірку масиву, як у репозиторію):
  ```javascript
  // ... (додай в addTask.reducer):
  reducer(state, action) {
    if (!Array.isArray(state)) {
      return [action.payload];
    }
    state.push(action.payload);
  },
  // Інше як раніше
  ```

- **src/components/TaskList/TaskList.jsx** (додай перевірки, як у репозиторію):
  ```jsx
  // ...
  const tasks = useSelector(getTasks) || [];
  // ...
  if (!Array.isArray(tasks)) {
    return null;
  }
  // ...
  ```

- **src/components/TaskCounter/TaskCounter.jsx** (додай перевірки):
  ```jsx
  // ...
  const tasks = useSelector(getTasks) || [];
  if (!Array.isArray(tasks)) {
    return null;
  }
  // ...
  ```

- **src/main.jsx** (додай PersistGate):
  ```jsx
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

- **Тест**: Завдання зберігаються після перезавантаження. Якщо localStorage пошкоджений, перевірки запобігають крашам.
