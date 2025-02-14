import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {
      name: "",
      email: "",
      username: "",
      roles: [],
      photoUrl: "",
    },
    showProfileDropdown: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
        ? action.payload
        : { name: "", email: "", username: "", roles: [], photoUrl: "" };
    },
    showProfileDropdown: (state, action) => {
      state.showProfileDropdown = action.payload;
    },
  },
});

export const { setUser, showProfileDropdown } = userSlice.actions;
export default userSlice.reducer;
