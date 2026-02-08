import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    products: productsReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["user/login/fulfilled", "user/login/rejected"],
      },
    }),
});
