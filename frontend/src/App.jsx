import React from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import LoginPage from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import CourseRegistration from './components/Register';
import FaceRecognition from './components/FaceRecognition';

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
        <Route path="/face" element={<PublicRoute restricted={true} element={FaceRecognition} />} />
        <Route path="/home" element={<PrivateRoute element={Home} />} />
        <Route path="/register" element={<PrivateRoute element={CourseRegistration} />} />
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/home" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;