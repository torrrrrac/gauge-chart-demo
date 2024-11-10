import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import GaugeChart from './gaugeFiles/GaugeChart';

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <GaugeChart />
      </div>
    </Provider>
  );
}

export default App;