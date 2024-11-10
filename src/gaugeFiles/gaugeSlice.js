import { createSlice } from '@reduxjs/toolkit';

const gaugeSlice = createSlice({
  name: 'gauge',
  initialState: {
    value: 50
  },
  reducers: {
    setGaugeValue: (state, action) => {
      const newValue = Math.min(100, Math.max(0, action.payload));
      state.value = newValue;
    },
    setRandomValue: (state) => {
      state.value = Math.floor(Math.random() * 101);
    }
  }
});

export const { setGaugeValue, setRandomValue } = gaugeSlice.actions;
export default gaugeSlice.reducer;