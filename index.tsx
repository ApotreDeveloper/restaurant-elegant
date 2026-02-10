
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { validateEnv } from './src/utils/validateEnv';

// Check environment variables before rendering
validateEnv();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
