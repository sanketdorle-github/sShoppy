import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// Async thunk to fetch cart from API
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().user;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log("Fetch Cart Response:", result);

      if (result.success && response.ok) {
        // Transform API response to match our local structure
        const items =
          result.data.items?.map((item) => ({
            _id: `${item.product._id}_${item.variant.color}_${item.variant.size}`,
            productId: item.product._id,
            name: item.product.name,
            price: item.price || item.product.price,
            image:
              item.product.images?.[0] || "https://via.placeholder.com/300",
            variant: {
              color: item.variant.color,
              size: item.variant.size,
              variantId: `${item.product._id}_${item.variant.color}_${item.variant.size}`,
            },
            quantity: item.quantity,
            totalPrice: item.quantity * (item.price || item.product.price),
            createdAt: new Date().toISOString(),
          })) || [];

        return {
          items,
          cartId: result.data.cartId,
          totalItems: result.data.totalItems,
          totalPrice: result.data.totalPrice,
        };
      } else {
        return rejectWithValue(result.message || "Failed to fetch cart");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

// Async thunk to add item to cart
export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async (
    { productId, color, size, quantity },
    { rejectWithValue, getState },
  ) => {
    try {
      const { token } = getState().user;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, color, size, quantity }),
      });

      const result = await response.json();
      console.log("Add to Cart Response:", result);

      if (result.success && response.ok) {
        // Transform the newly added item
        const newItem = {
          _id: `${productId}_${color}_${size}`,
          productId,
          name: result.data.items?.[0]?.product?.name || "Product",
          price: result.data.items?.[0]?.price || 0,
          image:
            result.data.items?.[0]?.product?.images?.[0] ||
            "https://via.placeholder.com/300",
          variant: {
            color,
            size,
            variantId: `${productId}_${color}_${size}`,
          },
          quantity,
          totalPrice: quantity * (result.data.items?.[0]?.price || 0),
          createdAt: new Date().toISOString(),
        };

        return {
          items: [newItem],
          message: result.message,
        };
      } else {
        return rejectWithValue(result.message || "Failed to add item to cart");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

// Async thunk to update cart item quantity
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (
    { productId, color, size, quantity },
    { rejectWithValue, getState },
  ) => {
    try {
      const { token } = getState().user;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/cart/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, color, size, quantity }),
        },
      );

      const result = await response.json();
      console.log("Update Cart Response:", result);

      if (result.success && response.ok) {
        // Return the updated item data
        return {
          productId,
          color,
          size,
          quantity,
          items: result.data.items || [],
        };
      } else {
        return rejectWithValue(result.message || "Failed to update cart");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

// Async thunk to remove item from cart
export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async ({ productId, color, size }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().user;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/cart/remove`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, color, size }),
        },
      );

      const result = await response.json();
      console.log("Remove from Cart Response:", result);

      if (result.success && response.ok) {
        return { productId, color, size };
      } else {
        return rejectWithValue(
          result.message || "Failed to remove item from cart",
        );
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

// Async thunk to clear cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().user;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/cart/clear`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();
      console.log("Clear Cart Response:", result);

      if (result.success && response.ok) {
        return true;
      } else {
        return rejectWithValue(result.message || "Failed to clear cart");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

// Async thunk to checkout
export const checkoutCart = createAsyncThunk(
  "cart/checkoutCart",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().user;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/cart/checkout`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();
      console.log("Checkout Response:", result);

      if (result.success && response.ok) {
        return result.data;
      } else {
        return rejectWithValue(result.message || "Checkout failed");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastUpdated: null,
    cartId: null,
    totalItems: 0,
    totalPrice: 0,
    shippingAddress: null,
    selectedShippingMethod: null,
    discount: {
      code: null,
      amount: 0,
      percentage: 0,
    },
    checkoutData: null,
  },
  reducers: {
    // Add item to cart (for guest users or before login)
    addToCart: (state, action) => {
      const {
        productId,
        name,
        price,
        image,
        variant,
        quantity = 1,
      } = action.payload;

      const itemId = `${productId}_${variant.color}_${variant.size}`;

      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        (item) => item._id === itemId,
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += quantity;
        state.items[existingItemIndex].totalPrice =
          state.items[existingItemIndex].quantity *
          state.items[existingItemIndex].price;
      } else {
        // Add new item to cart
        const newItem = {
          _id: itemId,
          productId,
          name,
          price,
          image,
          variant,
          quantity,
          totalPrice: price * quantity,
          createdAt: new Date().toISOString(),
        };
        state.items.push(newItem);
      }

      // Update totals
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      state.totalPrice = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0,
      );
      state.lastUpdated = new Date().toISOString();

      toast.success(
        `Added ${quantity} ${quantity > 1 ? "items" : "item"} to cart!`,
        {
          position: "bottom-right",
        },
      );
    },

    // Remove item from cart (local only)
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);

      // Update totals
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      state.totalPrice = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0,
      );
      state.lastUpdated = new Date().toISOString();

      toast.info("Item removed from cart");
    },

    // Update item quantity (local only)
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item._id === itemId);

      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = Math.max(1, quantity);
        state.items[itemIndex].totalPrice =
          state.items[itemIndex].quantity * state.items[itemIndex].price;

        // Update totals
        state.totalItems = state.items.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        state.totalPrice = state.items.reduce(
          (total, item) => total + item.totalPrice,
          0,
        );
        state.lastUpdated = new Date().toISOString();
      }
    },

    // Set shipping address
    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },

    // Set shipping method
    setShippingMethod: (state, action) => {
      state.selectedShippingMethod = action.payload;
    },

    // Apply discount code
    applyDiscount: (state, action) => {
      const { code, amount, percentage } = action.payload;
      state.discount = { code, amount, percentage };
      toast.success(`Discount code "${code}" applied!`);
    },

    // Remove discount code
    removeDiscount: (state) => {
      state.discount = { code: null, amount: 0, percentage: 0 };
      toast.info("Discount code removed");
    },

    // Merge guest cart with user cart after login
    mergeCart: (state, action) => {
      const userCartItems = action.payload;

      // Create a map of existing items by productId + variant
      const existingItemsMap = new Map();
      state.items.forEach((item) => {
        existingItemsMap.set(item._id, item);
      });

      // Merge with user cart items
      userCartItems.forEach((userItem) => {
        if (existingItemsMap.has(userItem._id)) {
          // Item exists in both carts, use the larger quantity
          const existingItem = existingItemsMap.get(userItem._id);
          existingItem.quantity = Math.max(
            existingItem.quantity,
            userItem.quantity,
          );
          existingItem.totalPrice = existingItem.quantity * existingItem.price;
        } else {
          // Item only exists in user cart, add it
          state.items.push(userItem);
        }
      });

      // Update totals
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      state.totalPrice = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0,
      );
      state.lastUpdated = new Date().toISOString();
    },

    // Reset cart state
    resetCart: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.lastUpdated = null;
      state.cartId = null;
      state.totalItems = 0;
      state.totalPrice = 0;
      state.shippingAddress = null;
      state.selectedShippingMethod = null;
      state.discount = { code: null, amount: 0, percentage: 0 };
      state.checkoutData = null;
    },

    // Set checkout data
    setCheckoutData: (state, action) => {
      state.checkoutData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.cartId = action.payload.cartId;
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to load cart");
      })

      // Add Item to Cart
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;

        // Check if item already exists locally
        const newItem = action.payload.items[0];
        const existingItemIndex = state.items.findIndex(
          (item) => item._id === newItem._id,
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          state.items[existingItemIndex].quantity += newItem.quantity;
          state.items[existingItemIndex].totalPrice =
            state.items[existingItemIndex].quantity *
            state.items[existingItemIndex].price;
        } else {
          // Add new item
          state.items.push(newItem);
        }

        // Update totals
        state.totalItems = state.items.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        state.totalPrice = state.items.reduce(
          (total, item) => total + item.totalPrice,
          0,
        );
        state.lastUpdated = new Date().toISOString();

        // toast.success(action.payload.message || "Added to cart!");
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Failed to add item to cart");
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;

        const { productId, color, size, quantity } = action.payload;
        const itemId = `${productId}_${color}_${size}`;
        const itemIndex = state.items.findIndex((item) => item._id === itemId);

        if (itemIndex >= 0) {
          state.items[itemIndex].quantity = quantity;
          state.items[itemIndex].totalPrice =
            state.items[itemIndex].quantity * state.items[itemIndex].price;

          // Update totals
          state.totalItems = state.items.reduce(
            (total, item) => total + item.quantity,
            0,
          );
          state.totalPrice = state.items.reduce(
            (total, item) => total + item.totalPrice,
            0,
          );
          state.lastUpdated = new Date().toISOString();

          toast.success("Cart updated successfully");
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Failed to update cart");
      })

      // Remove Item from Cart
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.loading = false;

        const { productId, color, size } = action.payload;
        const itemId = `${productId}_${color}_${size}`;
        state.items = state.items.filter((item) => item._id !== itemId);

        // Update totals
        state.totalItems = state.items.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        state.totalPrice = state.items.reduce(
          (total, item) => total + item.totalPrice,
          0,
        );
        state.lastUpdated = new Date().toISOString();

        toast.success("Item removed from cart");
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Failed to remove item from cart");
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.lastUpdated = new Date().toISOString();
        toast.success("Cart cleared successfully");
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Failed to clear cart");
      })

      // Checkout Cart
      .addCase(checkoutCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutData = action.payload;
        toast.success("Checkout successful!");
      })
      .addCase(checkoutCart.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Checkout failed");
      });
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartId = (state) => state.cart.cartId;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartSubtotal = (state) => state.cart.totalPrice;
export const selectCartDiscount = (state) => state.cart.discount;
export const selectShippingAddress = (state) => state.cart.shippingAddress;
export const selectShippingMethod = (state) =>
  state.cart.selectedShippingMethod;
export const selectCheckoutData = (state) => state.cart.checkoutData;

// Calculate total with discount and shipping
export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const discount = state.cart.discount;
  const shipping = state.cart.selectedShippingMethod?.price || 0;

  let discountedAmount = subtotal;

  // Apply percentage discount first
  if (discount.percentage > 0) {
    discountedAmount = subtotal * (1 - discount.percentage / 100);
  }

  // Then apply fixed amount discount
  if (discount.amount > 0) {
    discountedAmount = Math.max(0, discountedAmount - discount.amount);
  }

  return discountedAmount + shipping;
};

// Calculate tax (example: 10% tax)
export const selectCartTax = (state) => {
  const subtotal = selectCartSubtotal(state);
  return subtotal * 0.1; // 10% tax rate
};

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setShippingAddress,
  setShippingMethod,
  applyDiscount,
  removeDiscount,
  mergeCart,
  resetCart,
  setCheckoutData,
} = cartSlice.actions;

export default cartSlice.reducer;
