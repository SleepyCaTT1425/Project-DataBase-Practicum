import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Booking from './pages/Booking';
import MyShop from './pages/MyShop';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking isLoggedIn={isLoggedIn} />} />
        <Route path="/my-shop" element={isLoggedIn ? <MyShop /> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={isLoggedIn ? <Admin /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={() => { setIsLoggedIn(true); localStorage.setItem('isLoggedIn', 'true'); }} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
