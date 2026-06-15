import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const admin = JSON.parse(sessionStorage.getItem("admin"));

const initialState = {
  admin: admin ? admin : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const loginAdmin = createAsyncThunk("admin/login", async (adminData, thunkAPI) => {
  try {
    const response = await fetch("/api/admins/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminData),
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      return thunkAPI.rejectWithValue(text || `Server error: ${response.status}`);
    }

    if (!response.ok) {
      return thunkAPI.rejectWithValue(data?.message || "Login failed");
    }

    if (data) {
      sessionStorage.setItem("admin", JSON.stringify(data));
    }
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const logoutAdmin = createAsyncThunk("admin/logout", async () => {
  sessionStorage.removeItem("admin");
});

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    resetAdmin: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.admin = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.admin = null;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
      });
  },
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;
