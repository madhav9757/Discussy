import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRouter from './router.jsx';
import Header from './components/header/Header.jsx';
import { setCredentials } from './features/auth/authSlice.js';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUserInfoFromStorage = () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        const token = localStorage.getItem('token');

        if (userInfo && userInfo !== 'undefined' && token && token !== 'undefined') {
          return {
            user: JSON.parse(userInfo),
            token
          };
        }
        return null;
      } catch (error) {
        console.warn('Failed to parse user data from localStorage:', error);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        return null;
      }
    };

    const userData = getUserInfoFromStorage();
    if (userData) {
      dispatch(setCredentials(userData));
    }
  }, [dispatch]);

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <AppRouter />
      </main>
      <Toaster position="top-center" />
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default App;
