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

const rootReducer = (state = initialState, action) => {
  // Редюсер розрізняє екшени за значенням властивості type
  switch (action.type) {
    // Залежно від типу екшену виконуватиметься різна логіка
    case "tasks/addTask": {
      // Потрібно повернути копію об'єкту поточного стану
      // в якому є всі дані існуючого стану
      return {
        ...state,
        tasks: {
          // та новий масив задач в якому є всі існуючі завдання
          // та об'єкт нового завдання
          items: [...state.tasks.items, action.payload],
        },
      };
    }
    case "tasks/deleteTask":
      return {
        ...state,
        tasks: {
          items: state.tasks.items.filter((task) => task.id !== action.payload),
        },
      };
    case "tasks/toggleCompleted":
      return {
        ...state,
        tasks: {
          items: state.tasks.items.map((task) => {
            if (task.id !== action.payload) {
              return task;
            }
            return {
              ...task,
              completed: !task.completed,
            };
          }),
        },
      };
    case "filters/setStatusFilter":
      return {
        ...state,
        filters: {
          status: action.payload,
        },
      };

    default:
      return state;
  }
};

export const store = configureStore({
  reducer: rootReducer,
});
