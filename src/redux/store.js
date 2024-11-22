import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../redux/slide/authSlide'

export default configureStore({
  reducer: {
    auth: authReducer,
  }
})