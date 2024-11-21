import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from '../../utils/axios'

export const register = createAsyncThunk("auth/register", async (userDate, thunkAPI) => {
  try {
    const response = await axios.post("/users", userDate)
    return response
  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})
export const login = createAsyncThunk("auth/login", async (userDate, thunkAPI) => {
  try {
    const response = await axios.post("auth/login", userDate)
    localStorage.setItem("token", response.result.token)
    return response.result.token

  } catch (error) {
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})

const initialState = {
  // user: JSON.parse(localStorage.getItem('token')) || null,
  users: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  isLoggedIn: false,
  message: "",
  token: localStorage.getItem('token') || null,
  isRegister: false,
}

export const authSlide = createSlice({
  name: 'register',
  initialState,
  reducers: {
    RESET(state) {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.isRegister = false;
      state.isLoggedIn = false;
      state.message = "";
    }
  },
  extraReducers: (builder) => {
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isRegister = true;
      state.isError = false;
      state.message = action.payload.message;

    });

    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = true;
      state.isError = true;
      state.message = action.payload;
      // toast.error(action.payload)
    });

    //login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.isError = false;
      state.token = action.payload;
      state.message = action.payload.message;

    });

    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = true;
      state.isError = true;
      state.message = action.payload;
    });
  },
})

export const { RESET } = authSlide.actions

export default authSlide.reducer