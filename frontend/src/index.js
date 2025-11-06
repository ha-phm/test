import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import './index.css';
import App from './App';

// 1. Tìm thẻ HTML có id là 'root'
const rootElement = document.getElementById('root');

// 2. Tạo "gốc" React tại thẻ đó
const root = ReactDOM.createRoot(rootElement);

// 3. Render ứng dụng (component <App/>) vào "gốc" đó
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);