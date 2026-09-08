import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from 'react-hot-toast';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#183a3e',
            border: '1px solid #e3eded',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(20, 60, 65, 0.12)',
            fontSize: '13px',
            fontWeight: 500,
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#119b8d',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#d8545d',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
