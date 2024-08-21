// src/redux/slices/userSlice.js
import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  token: null,
  userData: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const {token, userData} = action.payload;
      state.token = token;
      state.userData = userData;
    },
    clearUserData: state => {
      state.token = null;
      state.userData = null;
    },
  },
});

export const {setUserData, clearUserData} = userSlice.actions;
export default userSlice.reducer;
