// src/main.jsx

// src/main.jsx (very top, before anything else)
const theme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (theme === 'dark' || (!theme && prefersDark)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import MainApp from './MainApp.jsx';
import { store } from './store';

// Toastify imports
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './tailwind.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <MainApp />
      {/* ToastContainer renders toasts above the app */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        // Dynamically set light or dark:
        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        toastClassName="bg-gray-500 dark:bg-gray-50 dark:text-gray-900 text-gray-100 shadow-xl rounded-lg"
        bodyClassName="px-4 py-2 font-medium"
        progressClassName="!bg-blue-500"
      />
    </Provider>
  </StrictMode>
);