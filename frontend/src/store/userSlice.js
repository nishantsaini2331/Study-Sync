import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    showProfileDropdown: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    showProfileDropdown: (state, action) => {
      state.showProfileDropdown = action.payload;
    },
  },
});

export const { setUser , showProfileDropdown} = userSlice.actions;
export default userSlice.reducer;
