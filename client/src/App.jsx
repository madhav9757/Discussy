import React, { use, useEffect } from 'react';
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
    const userInfoFromStorage = localStorage.getItem('userInfo');
    if (userInfoFromStorage) {
      dispatch(setCredentials(JSON.parse(userInfoFromStorage)));
    }
  }, []);

  return (
    <>
      <Header />
      <AppRouter />
      <Toaster position="top-center" />
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;
