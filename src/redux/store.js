import { configureStore } from "@reduxjs/toolkit";

const initialState = {
  tasks: {
    items: [
      { id: 0, text: "Learn HTML and CSS", completed: true },
      { id: 1, text: "Get good at JavaScript", completed: true },
      { id: 2, text: "Master React", completed: false },
      { id: 3, text: "Discover Redux", completed: false },
      { id: 4, text: "Build amazing apps", completed: false },
    ],
  },
  filters: {
    status: "all",
  },
};

// Відповідає лише за оновлення властивості tasks
// Значенням параметра state буде об'єкт завдань
const tasksReducer = (state = initialState.tasks, action) => {
  switch (action.type) {
    case "tasks/addTask": {
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }

    case "tasks/deleteTask":
      return {
        ...state,
        items: state.items.filter((task) => task.id !== action.payload),
      };

    case "tasks/toggleCompleted":
      return {
        ...state,
        items: state.items.map((task) => {
          if (task.id !== action.payload) {
            return task;
          }
          return {
            ...task,
            completed: !task.completed,
          };
        }),
      };

    default:
      return state;
  }
};

// Відповідає лише за оновлення властивості filters
// Значенням параметра state буде об'єкт фільтрів
const filtersReducer = (state = initialState.filters, action) => {
  switch (action.type) {
    case "filters/setStatusFilter":
      return {
        ...state,
        status: action.payload,
      };

    default:
      return state;
  }
};

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    filters: filtersReducer,
  },
});
