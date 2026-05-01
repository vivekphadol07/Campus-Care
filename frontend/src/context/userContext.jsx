import React, { createContext, useState, useEffect, useContext } from 'react';
import { socket } from '../utils/socket';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && storedUser !== 'undefined') {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
                
                // Socket connection
                socket.connect();
                socket.emit('join_room', `user_${parsedUser.id}`);
            } catch (error) {
                console.error("Error parsing stored user data:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);

        return () => {
            socket.disconnect();
        };
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        socket.connect();
        socket.emit('join_room', `user_${userData.id}`);
    };

    const logout = () => {
        socket.disconnect();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };


    return (
        <UserContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
            {!loading && children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
