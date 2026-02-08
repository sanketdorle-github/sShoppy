import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const LOCAL_STORAGE_KEY = "user";

// Helper function to validate user object
const isValidUser = (userObj) => {
  return (
    userObj && userObj.token && userObj.id && userObj.email && userObj.name
  );
};

// Load and validate user from localStorage on initial load
const initializeUserState = () => {
  try {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      if (isValidUser(parsedUser)) {
        return {
          token: parsedUser.token,
          user: {
            id: parsedUser.id,
            name: parsedUser.name,
            email: parsedUser.email,
            role: parsedUser.role || "user",
          },
          userRole: parsedUser.role || "user",
          loading: false,
          error: null,
          isAuthenticated: true,
        };
      } else {
        // Clear invalid data
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error("Error loading user from storage:", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  // Return default state if no valid user found
  return {
    token: null,
    user: null,
    userRole: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  };
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const loginData = { email, password };
      if (role === "admin") {
        loginData.role = "admin";
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        const userData = result.data;

        // Structure the user data similar to your AdminAuthContext
        const structuredUser = {
          id: userData.user.id,
          name: userData.user.name,
          email: userData.user.email,
          role: userData.user.role || "user",
          token: userData.token,
        };

        // Save to localStorage using the same key
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(structuredUser));

        return {
          user: structuredUser,
          token: userData.token,
        };
      } else {
        return rejectWithValue(result.message || "Login failed");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Clear localStorage using the same key
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    console.log("in register");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        },
      );
      const result = await response.json();

      if (result.success && response.ok) {
        const userData = result.data;

        // Structure the user data similar to your AdminAuthContext
        const structuredUser = {
          id: userData.user.id,
          name: userData.user.name,
          email: userData.user.email,
          role: userData.user.role || "user",
          token: userData.token,
        };

        // Save to localStorage using the same key
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(structuredUser));

        return {
          user: structuredUser,
          token: userData.token,
        };
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  },
);

// Async thunk for validating and refreshing token
export const validateUserSession = createAsyncThunk(
  "user/validateSession",
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!storedUser) {
        return rejectWithValue("No session found");
      }

      const parsedUser = JSON.parse(storedUser);

      if (!isValidUser(parsedUser)) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return rejectWithValue("Invalid session data");
      }

      // Optional: Validate token with API
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/validate`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${parsedUser.token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          return {
            user: parsedUser,
            token: parsedUser.token,
          };
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          return rejectWithValue("Session expired");
        }
      } catch (apiError) {
        // If API validation fails, still use localStorage if data is valid
        // This allows offline access (remove if you want strict validation)
        console.warn(
          "API validation failed, using localStorage data:",
          apiError,
        );
        return {
          user: parsedUser,
          token: parsedUser.token,
        };
      }
    } catch (error) {
      console.error("Session validation error:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return rejectWithValue("Session validation failed");
    }
  },
);

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!storedUser) {
        return rejectWithValue("No user found");
      }

      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser.token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${parsedUser.token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        // Update localStorage with fresh data
        const updatedUser = {
          ...parsedUser,
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role || "user",
        };

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));

        return result.data;
      } else {
        // If token is invalid, clear storage
        if (response.status === 401) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        return rejectWithValue(result.message || "Failed to fetch profile");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!storedUser) {
        return rejectWithValue("No user found");
      }

      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser.token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${parsedUser.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        // Update localStorage
        const updatedUser = {
          ...parsedUser,
          name: result.data.name || parsedUser.name,
          email: result.data.email || parsedUser.email,
          role: result.data.role || parsedUser.role,
        };

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));

        return result.data;
      } else {
        return rejectWithValue(result.message || "Failed to update profile");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState: initializeUserState,
  reducers: {
    // Sync actions
    setUser: (state, action) => {
      const userData = action.payload;

      const structuredUser = {
        id: userData.user.id,
        name: userData.user.name,
        email: userData.user.email,
        role: userData.user.role || "user",
        token: userData.token,
      };

      state.user = structuredUser;
      state.token = userData.token;
      state.userRole = userData.user.role || "user";
      state.isAuthenticated = true;
      state.error = null;

      // Save to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(structuredUser));
    },

    clearUser: (state) => {
      state.token = null;
      state.user = null;
      state.userRole = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Restore user from localStorage (call this on app mount)
    restoreUserFromStorage: (state) => {
      try {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          if (isValidUser(parsedUser)) {
            state.user = {
              id: parsedUser.id,
              name: parsedUser.name,
              email: parsedUser.email,
              role: parsedUser.role || "user",
            };
            state.token = parsedUser.token;
            state.userRole = parsedUser.role || "user";
            state.isAuthenticated = true;
            state.error = null;
          } else {
            // Clear invalid data
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            state.isAuthenticated = false;
          }
        }
      } catch (error) {
        console.error("Error restoring user from storage:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        state.isAuthenticated = false;
      }
    },

    // Validate localStorage data (similar to your AdminAuthContext useEffect)
    validateLocalStorage: (state) => {
      try {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          if (isValidUser(parsedUser)) {
            // Update state if not already authenticated
            if (!state.isAuthenticated) {
              state.user = {
                id: parsedUser.id,
                name: parsedUser.name,
                email: parsedUser.email,
                role: parsedUser.role || "user",
              };
              state.token = parsedUser.token;
              state.userRole = parsedUser.role || "user";
              state.isAuthenticated = true;
              state.error = null;
            }
          } else {
            // Clear invalid data
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            if (state.isAuthenticated) {
              state.isAuthenticated = false;
              state.token = null;
              state.user = null;
              state.userRole = null;
            }
          }
        } else {
          // Clear state if no data in localStorage
          if (state.isAuthenticated) {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.userRole = null;
          }
        }
      } catch (error) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.userRole = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.userRole = action.payload.user.role || "user";
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.userRole = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Validate Session
    builder
      .addCase(validateUserSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateUserSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.userRole = action.payload.user.role || "user";
        state.error = null;
      })
      .addCase(validateUserSession.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.userRole = null;
        state.error = action.payload;
      });

    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload,
        };
        state.userRole = action.payload?.role || state.userRole;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If token is invalid, clear auth state
        if (
          action.payload?.includes("401") ||
          action.payload?.includes("unauthorized")
        ) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.userRole = null;
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
        toast.success("Profile updated successfully!");
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to update profile");
      });
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userRole = action.payload.user.role;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.userRole = null;
        state.token = null;
      });
  },
});

export const {
  setUser,
  clearUser,
  setError,
  clearError,
  restoreUserFromStorage,
  validateLocalStorage,
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.token;
export const selectUserRole = (state) => state.user.userRole;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectLoading = (state) => state.user.loading;
export const selectError = (state) => state.user.error;

export default userSlice.reducer;
