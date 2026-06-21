import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    // Redirect ke halaman login jika token tidak ditemukan
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute;