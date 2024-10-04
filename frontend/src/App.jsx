import React from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import LoginPage from './components/Login';
import Session from './components/Session';
import Signup from './components/Signup';

const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null;
};

const PrivateRoute = ({ element: Element, ...rest }) => (
  isAuthenticated() ? <Element {...rest} /> : <Navigate to="/login" replace />
);

const PublicRoute = ({ element: Element, restricted, ...rest }) => (
  isAuthenticated() && restricted ? <Navigate to="/home" replace /> : <Element {...rest} />
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute restricted={true} element={LoginPage} />} />
        <Route path="/signup" element={<PublicRoute restricted={true} element={Signup} />} />
        <Route path="/home" element={<PrivateRoute element={Session} />} />
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/home" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;