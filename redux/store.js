// store.js
import {configureStore} from '@reduxjs/toolkit';
import loaderReducer from './reducers/reducer';
import userReducer from './reducers/userSlice';

// Configure the store
const store = configureStore({
  reducer: {
    loader: loaderReducer,
    user: userReducer,
  },
});

export default store;
