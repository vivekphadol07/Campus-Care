import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/userContext';

const PrivateRoute = ({ allowedRoles = [], redirectPath = '/login' }) => {
    const { user, isAuthenticated, loading } = useUser();

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />; // Or unauthorized page
    }

    return <Outlet />;
};

export default PrivateRoute;
