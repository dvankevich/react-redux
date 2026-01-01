Це логічне завершення функціонала: ми додамо можливість масового видалення завершених справ. Завдяки вашим попереднім налаштуванням `redux-persist` та `Middleware`, ця зміна миттєво відобразиться в `localStorage` та буде зафіксована в консолі.

Ось покроковий план реалізації:

---

### 1. Додавання екшену в `src/redux/tasksSlice.js`

Нам потрібно додати новий редюсер `deleteCompleted`, який залишить у стані лише ті завдання, де `completed` дорівнює `false`.

```javascript
// src/redux/tasksSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const tasksSlice = createSlice({
  name: "tasks",
  initialState: [],
  reducers: {
    addTask: { /* ... існуючий код ... */ },
    deleteTask(state, action) { /* ... існуючий код ... */ },
    toggleCompleted(state, action) { /* ... існуючий код ... */ },

    // Новий редюсер для очищення завершених завдань
    deleteCompleted(state) {
      return state.filter(task => !task.completed);
    },
  },
});

export const { addTask, deleteTask, toggleCompleted, deleteCompleted } = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;

```

---

### 2. Створення кнопки в інтерфейсі

Найкраще місце для такої кнопки — компонент `AppBar`, поруч із лічильником завдань. Ми використаємо вже існуючий у вашому проєкті компонент `Button`.

**Оновлений `src/components/AppBar/AppBar.jsx`:**

```javascript
// src/components/AppBar/AppBar.jsx
import { useDispatch } from "react-redux";
import { deleteCompleted } from "../../redux/tasksSlice";
import { Button } from "../Button/Button";
import { StatusFilter } from '../StatusFilter/StatusFilter';
import { TaskCounter } from '../TaskCounter/TaskCounter';
import css from './AppBar.module.css';

export const AppBar = () => {
  const dispatch = useDispatch();

  return (
    <header className={css.wrapper}>
      <section className={css.section}>
        <h2 className={css.title}>Tasks</h2>
        <TaskCounter />
        {/* Кнопка для видалення виконаних завдань */}
        <Button onClick={() => dispatch(deleteCompleted())}>
          Clear Completed
        </Button>
      </section>
      <section className={css.section}>
        <h2 className={css.title}>Filter by status</h2>
        <StatusFilter />
      </section>
    </header>
  );
};

```

---

### Як це працює в системі (ланцюжок подій)

Коли ви натискаєте кнопку "Clear Completed":

1. **Dispatch**: Екшен `tasks/deleteCompleted` відправляється в стор.
2. **Middleware (Logger)**: Ваш кастомний логер перехоплює подію, виводить у консоль `Prev state` (де є виконані завдання) та сам об'єкт екшену.
3. **Reducer**: `tasksReducer` фільтрує масив.
4. **Redux Persist Middleware**: Бібліотека помічає зміну стану `tasks` і автоматично оновлює рядок у `localStorage`.
5. **UI Update**: Список завдань у `TaskList` та лічильник у `TaskCounter` миттєво оновлюються, оскільки вони підписані на стан через `useSelector`.

---

### Чому це важливо для `redux-persist`?

Оскільки ми налаштували `persistReducer` саме для `tasks` у `store.js`, будь-яка зміна в цьому масиві (додавання, видалення одного елемента або масове видалення) автоматично робить стан у браузері "живим". Навіть якщо користувач випадково закриє вкладку відразу після натискання кнопки, при наступному візиті виконаних завдань уже не буде.

