import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    { page = 1, limit = 10, search = "" },
    { rejectWithValue, getState },
  ) => {
    try {
      const { token } = getState().user;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/?page=${page}&limit=${limit}&search=${search}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        return result.data;
      } else {
        return rejectWithValue(result.message || "Failed to fetch products");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);
// Async thunk for creating product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formDataObj, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().user;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type header for FormData
            // The browser will automatically set it with the correct boundary
          },
          body: formDataObj, // Send FormData directly
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        return result.data;
      } else {
        return rejectWithValue(result.message || "Failed to create product");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

// Async thunk for updating product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formDataObj }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().user;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/update/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type header for FormData
          },
          body: formDataObj, // Send FormData directly
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        return result.data;
      } else {
        return rejectWithValue(result.message || "Failed to update product");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);
// Async thunk for deleting product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().user;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/hard/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        return id;
      } else {
        return rejectWithValue(result.message || "Failed to delete product");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

// Async thunk for bulk deleting products
export const bulkDeleteProducts = createAsyncThunk(
  "products/bulkDelete",
  async (ids, { rejectWithValue, getState }) => {
    try {
      console.log("bulk delete", ids);

      const { token } = getState().user;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/bulk-delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids }),
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        return ids;
      } else {
        return rejectWithValue(result.message || "Failed to delete products");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

const initialState = {
  products: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  selectedProducts: [],
  searchQuery: "",
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Sync actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    toggleSelectProduct: (state, action) => {
      const productId = action.payload;
      if (state.selectedProducts.includes(productId)) {
        state.selectedProducts = state.selectedProducts.filter(
          (id) => id !== productId,
        );
      } else {
        state.selectedProducts.push(productId);
      }
    },
    selectAllProducts: (state) => {
      if (state.selectedProducts.length === state.products.length) {
        state.selectedProducts = [];
      } else {
        state.selectedProducts = state.products.map((product) => product._id);
      }
    },
    clearSelectedProducts: (state) => {
      state.selectedProducts = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Product
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.pagination.total += 1;
        // toast.success("Product created successfully!");
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to create product");
      });

    // Update Product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        // toast.success("Product updated successfully!");
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to update product");
      });

    // Delete Product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.pagination.total -= 1;
        state.selectedProducts = state.selectedProducts.filter(
          (id) => id !== action.payload,
        );
        toast.success("Product deleted successfully!");
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to delete product");
      });

    // Bulk Delete Products
    builder
      .addCase(bulkDeleteProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkDeleteProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (p) => !action.payload.includes(p._id),
        );
        state.pagination.total -= action.payload.length;
        state.selectedProducts = [];
        toast.success(
          `${action.payload.length} products deleted successfully!`,
        );
      })
      .addCase(bulkDeleteProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to delete products");
      });
  },
});

export const {
  setSearchQuery,
  setPage,
  setLimit,
  toggleSelectProduct,
  selectAllProducts,
  clearSelectedProducts,
  clearError,
} = productsSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectLoading = (state) => state.products.loading;
export const selectError = (state) => state.products.error;
export const selectPagination = (state) => state.products.pagination;
export const selectedProducts = (state) => state.products.selectedProducts;
export const selectSearchQuery = (state) => state.products.searchQuery;

export default productsSlice.reducer;
