// src/redux/tasksSlice.js

import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  // Ім'я слайсу
  name: "tasks",
  // Початковий стан редюсера слайсу
  initialState: {
    items: [
      { id: 0, text: "Learn HTML and CSS", completed: true },
      { id: 1, text: "Get good at JavaScript", completed: true },
      { id: 2, text: "Master React", completed: false },
      { id: 3, text: "Discover Redux", completed: false },
      { id: 4, text: "Build amazing apps", completed: false },
    ],
  },
  // Об'єкт case-редюсерів
  reducers: {
    addTask(state, action) {
      // ✅ Immer замінить це на операцію оновлення
      state.items.push(action.payload);
    },
    deleteTask(state, action) {
      // ✅ Immer замінить це на операцію оновлення
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    toggleCompleted(state, action) {
      // ✅ Immer замінить це на операцію оновлення
      for (const task of state.items) {
        if (task.id === action.payload) {
          task.completed = !task.completed;
          break;
        }
      }
    },
  },
});

// Експортуємо фабрики екшенів
export const { addTask, deleteTask, toggleCompleted } = slice.actions;

// Експортуємо редюсер слайсу
export default slice.reducer;
