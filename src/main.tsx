import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress Google Maps API errors to allow fallback UI to handle it gracefully
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && (args[0].includes('InvalidKeyMapError') || args[0].includes('Script error'))) {
    return;
  }
  originalConsoleError(...args);
};

window.onerror = function(message, source, lineno, colno, error) {
  if (typeof message === 'string' && (message.includes('InvalidKeyMapError') || message.includes('Script error'))) {
    return true; // Prevents the firing of the default event handler
  }
  return false;
};

window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('InvalidKeyMapError') || e.message.includes('Script error'))) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
