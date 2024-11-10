import { configureStore } from '@reduxjs/toolkit';
import gaugeReducer from './gaugeFiles/gaugeSlice';

export const store = configureStore({
  reducer: {
    gauge: gaugeReducer
  }
});