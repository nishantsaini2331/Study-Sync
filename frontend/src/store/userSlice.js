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
      courses: [],
      cart: [],
    },
    showProfileDropdown: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
        ? action.payload
        : {
            name: "",
            email: "",
            username: "",
            roles: [],
            photoUrl: "",
            courses: [],
            cart: [],
          };
    },
    showProfileDropdown: (state, action) => {
      state.showProfileDropdown = action.payload;
    },

    addToCart: (state, action) => {
      state.user.cart.push(action.payload);
    },
    removeFromCart: (state, action) => {
      state.user.cart = state.user.cart.filter(
        (courseId) => courseId !== action.payload
      );
    },
  },
});

export const { setUser, showProfileDropdown, removeFromCart, addToCart } =
  userSlice.actions;
export default userSlice.reducer;
