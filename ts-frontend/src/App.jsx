import React from 'react';
import NavBar from './components/Navbar';
import LoginPage  from './components/LoginPage'
import MyPage from './components/MyPage';
import HomePage from './components/HomePage';
import AddPropertyForm from './components/AddPropertyForm';


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/add-property" element={<AddPropertyForm />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
    </Router>
  );
}

export default App;