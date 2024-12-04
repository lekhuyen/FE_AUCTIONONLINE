import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../redux/slide/authSlide'
import productReducer from '../redux/slide/productSlide'

export default configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer
  }
})