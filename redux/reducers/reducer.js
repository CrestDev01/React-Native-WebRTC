// reducer.js
import {createSlice} from '@reduxjs/toolkit';

const loaderSlice = createSlice({
  name: 'loader',
  initialState: {loading: false},
  reducers: {
    startLoading: state => {
      state.loading = true;
    },
    stopLoading: state => {
      state.loading = false;
    },
  },
});

export const {startLoading, stopLoading} = loaderSlice.actions;
export default loaderSlice.reducer;
