// src/redux/filtersSlice.js

import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "filters",
  initialState: {
    status: "all",
  },
  reducers: {
    setStatusFilter(state, action) {
      // ✅ Immer замінить це на операцію оновлення
      state.status = action.payload;
    },
  },
});

export const { setStatusFilter } = slice.actions;
export default slice.reducer;
