import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // 👈 Imports your App component

// 1. Find the HTML element with id="root"
const rootElement = document.getElementById('root');

if (!rootElement) {
  // If this error shows in console (F12), check your index.html!
  console.error("❌ FATAL ERROR: Could not find element with id='root'");
} else {
  // 2. Render the App inside it
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}