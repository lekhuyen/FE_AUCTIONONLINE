import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from '../../utils/axios'

export const createProduct = createAsyncThunk("product/create", async (product, thunkAPI) => {
  try {
    const response = await axios.post("/auction/add", product, { multipart: true, authRequired: true })
    // console.log(response);

    return response
  } catch (error) {
    // console.log(error);
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})


const initialState = {
  code: null,
  message: '',
  isLoading: false,
}

export const productSlide = createSlice({
  name: 'product',
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder.addCase(createProduct.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      state.code = action.payload.code;
      state.message = action.payload.message;

    });

    builder.addCase(createProduct.rejected, (state, action) => {
      state.isLoading = true;
      state.code = action.payload.code;
      state.message = action.payload.message;
    });

  },
})

export const { } = productSlide.actions

export default productSlide.reducer