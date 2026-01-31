import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerServiceWorker } from './lib/pwa';

// Register service worker for PWA support (production only)
registerServiceWorker().then((result) => {
  if (result.registered) {
    console.log('[PWA] Service worker registered successfully');
  }
}).catch((error) => {
  console.error('[PWA] Service worker registration error:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
