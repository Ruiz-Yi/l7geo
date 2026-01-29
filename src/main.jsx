import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import 'antd/dist/reset.css';

const container = document.getElementById('app');
createRoot(container).render(<App />);
