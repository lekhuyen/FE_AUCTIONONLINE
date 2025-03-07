import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from '../../utils/axios'
import { toast } from 'react-toastify'

export const createProduct = createAsyncThunk("product/create", async (product, thunkAPI) => {
  try {
    const response = await axios.post("/auction/add", product, { multipart: true, authRequired: true })
    return response
  } catch (error) {
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})
export const updateProduct = createAsyncThunk("product/update", async (product, thunkAPI) => {
  try {
    const response = await axios.put("/auction/update", product, { multipart: true, authRequired: true })
    return response
  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})
export const getAllProduct = createAsyncThunk("product/getallproduct", async (paginate, thunkAPI) => {
  try {
    const response = await axios.get("/auction", {
      params: {
        page: paginate.page,
        size: paginate.size,
        name: paginate.searchName ? paginate.searchName : ""
      },
      headers: { authRequired: true }
    })

    return response
  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})

export const getAllProductBidding = createAsyncThunk("product/getallproductBidding", async (paginate, thunkAPI) => {
  try {
    const response = await axios.get("/auction/product")
    return response
  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})


export const deleteProduct = createAsyncThunk("product/deleteproduct", async (id, thunkAPI) => {
  try {
    const response = await axios.delete(`/auction/${id}`, { authRequired: true })
    return response
  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})

//getAllCategory
export const getAllCategory = createAsyncThunk("category/getallcategory", async (paginate, thunkAPI) => {
  try {
    const response = await axios.get("/category", {
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


//getAllProductByCreator
export const getAllProductByCreator = createAsyncThunk("auction/creator", async (userId, thunkAPI) => {
  try {
    const response = await axios.get(`auction/creator/${userId}`, {

      headers: { authRequired: true }
    })
    return response.result
  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})


//getAllProductByBuyer
export const getAllProductByBuyer = createAsyncThunk("auction/buyer", async (userId, thunkAPI) => {
  try {
    const response = await axios.get(`auction/buyer/${userId}`, {

      headers: { authRequired: true }
    })
    return response.result
  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})


export const auctionsuccess = createAsyncThunk("category/auctionsuccess", async (data, thunkAPI) => {
  try {
    const response = await axios.post(`/bidding/success/${data.productId}/${data.sellerId}`, null, { authRequired: true, timeout: 10000 })

    console.log(response);

    return response
  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})

//get product by category
export const getAllProductByCategory = createAsyncThunk("product/getallproductbycategory", async (paginate, thunkAPI) => {
  try {
    if (paginate.productId) {

      const response = await axios.get(`/auction/category/${paginate.productId}`, {
        params: {
          page: paginate.page,
          size: paginate.size,
        },
      })
      return response.result
    }

  } catch (error) {
    // console.log(error.response.data.message);
    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString() || error
    return thunkAPI.rejectWithValue(errorMessage)
  }
})

const initialState = {
  code: null,
  message: '',
  isLoading: false,
  products: [],
  productsBidding: [],
  productsOfCreator: [],
  productsOfBuyer: [],
  productsbycategory: [],
  categories: [],
  notification: {},
  notificationsBidding: [],
  notificationsBiddingLength: [],
  notificationchat: {},
}

export const productSlide = createSlice({
  name: 'product',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notification = action.payload
    },
    notificationchat: (state, action) => {
      state.notificationchat = action.payload
    },
    notificationBidding: (state, action) => {
      state.notificationsBidding = action.payload
      state.notificationsBiddingLength = action.payload
    },

  },
  extraReducers: (builder) => {
    builder.addCase(createProduct.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      state.code = action.payload.code;
      toast.success(action.payload.message);
    });

    builder.addCase(createProduct.rejected, (state, action) => {
      state.isLoading = true;
      state.code = action.payload.code;
      toast.success(action.payload.message);
    });

    //update
    builder.addCase(updateProduct.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      state.code = action.payload.code;
      toast.success(action.payload.message);
    });

    builder.addCase(updateProduct.rejected, (state, action) => {
      state.isLoading = false;
      state.code = action.payload.code;
      toast.error(action.payload);
    });

    //getAll
    builder.addCase(getAllProduct.pending, (state) => {
      state.isLoading = true;
      state.products = [];
    });

    builder.addCase(getAllProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      state.products = action.payload.result;
    });

    builder.addCase(getAllProduct.rejected, (state, action) => {

      // state.isLoading = true;
      state.products = [];
    });

    // all sp chua ban
    builder.addCase(getAllProductBidding.pending, (state) => {
      state.productsBidding = [];
    });

    builder.addCase(getAllProductBidding.fulfilled, (state, action) => {
      state.isLoading = false;
      state.productsBidding = action.payload.result;
    });

    builder.addCase(getAllProductBidding.rejected, (state, action) => {
      state.productsBidding = [];
    });
    // getAllProductByCreator
    builder.addCase(getAllProductByCreator.pending, (state) => {

      state.isLoading = true;
      state.productsOfCreator = [];
    });

    builder.addCase(getAllProductByCreator.fulfilled, (state, action) => {
      state.isLoading = false;
      state.productsOfCreator = action.payload;
    });

    builder.addCase(getAllProductByCreator.rejected, (state, action) => {
      state.isLoading = true;
      state.productsOfCreator = action.payload;
    });
    // getAllProductByBuyer
    builder.addCase(getAllProductByBuyer.pending, (state) => {
      state.isLoading = true;
      state.productsOfBuyer = [];
    });

    builder.addCase(getAllProductByBuyer.fulfilled, (state, action) => {
      state.isLoading = false;
      state.productsOfBuyer = action.payload;
    });

    builder.addCase(getAllProductByBuyer.rejected, (state, action) => {
      state.isLoading = true;
      state.productsOfBuyer = [];
    });


    //delete
    builder.addCase(deleteProduct.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      toast.success(action.payload.message)
    });

    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.isLoading = true;
      toast.success(action.payload.message)
    });



    //getCategory
    builder.addCase(getAllCategory.pending, (state) => {
      state.isLoading = true;
      state.categories = [];
    });

    builder.addCase(getAllCategory.fulfilled, (state, action) => {
      state.isLoading = false;
      state.categories = action.payload;
    });

    builder.addCase(getAllCategory.rejected, (state, action) => {
      state.isLoading = true;
      state.categories = action.payload;
    });


    //chot dau gia
    builder.addCase(auctionsuccess.pending, (state) => {
      // state.isLoading = true;
      console.log("pending");

    });

    builder.addCase(auctionsuccess.fulfilled, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(auctionsuccess.rejected, (state, action) => {
      // state.isLoading = true;
      console.log("rejected");
    });


    //get all product by category
    builder.addCase(getAllProductByCategory.pending, (state) => {
      // state.isLoading = true;
      state.productsbycategory = [];
    });

    builder.addCase(getAllProductByCategory.fulfilled, (state, action) => {
      // state.isLoading = false;
      state.productsbycategory = action.payload;
    });

    builder.addCase(getAllProductByCategory.rejected, (state, action) => {
      // state.isLoading = true;
      state.productsbycategory = action.payload;
    });
  },
})

export const { addNotification, notificationchat, notificationBidding } = productSlide.actions

export default productSlide.reducer