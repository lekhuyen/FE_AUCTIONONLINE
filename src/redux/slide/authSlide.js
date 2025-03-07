import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from '../../utils/axios'

export const getAllUsers = createAsyncThunk("auth/getAllUsers", async (paginate, thunkAPI) => {
  try {
    const response = await axios.get("/users", {
      params: {
        page: paginate.page,
        size: paginate.size,
      },
      headers: { authRequired: true }
    })
    return response.result
  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})
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
export const introspect = createAsyncThunk("auth/introspect", async (token, thunkAPI) => {
  try {
    const response = await axios.post("auth/introspect", token)
    // console.log(response);
    return response.result.valid
  } catch (error) {
    // console.log(error);
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
  isLoggedIn: localStorage.getItem("isIntrospect") || false,
  message: "",
  token: localStorage.getItem('token') || null,
  isRegister: false,
  // isIntrospect: localStorage.getItem('isIntrospect') || false,
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
    },
    // logout(state) {
    //   localStorage.removeItem("token");
    //   state.isLoggedIn = false;
    // }
  },
  extraReducers: (builder) => {

    //getAll users
    builder.addCase(getAllUsers.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload;
    });

    builder.addCase(getAllUsers.rejected, (state, action) => {
      state.isLoading = true;
      state.users = action.payload;
    });

    //register
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
      // state.isIntrospect = 
      localStorage.setItem('isIntrospect', "true");

    });

    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = true;
      state.isError = true;
      state.message = action.payload;
      localStorage.setItem('isIntrospect', "false");
    });


    // introspect
    builder.addCase(introspect.pending, (state) => {
      state.isIntrospect = false;
    });

    builder.addCase(introspect.fulfilled, (state, action) => {
      state.isLoggedIn = true;
      // state.isIntrospect = 
      localStorage.setItem('isIntrospect', action.payload);

    });

    builder.addCase(introspect.rejected, (state, action) => {
      state.isLoggedIn = false;
      // state.isIntrospect = 
      localStorage.setItem('isIntrospect', action.payload);;
    });
  },
})

export const { RESET, logout } = authSlide.actions

export default authSlide.reducer