import React, { useState, createContext, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
             if (window.chrome && chrome.storage) {
                chrome.storage.local.set({ currentUser: user });
            }
        } else {
            localStorage.removeItem('user');
            if (window.chrome && chrome.storage) {
                chrome.storage.local.remove('currentUser');
            }
        }
    }, [user]);

    const login = async (username, password) => {
        const userData = await api.login(username, password);
        setUser(userData);
        return userData;
    };

    const signup = async (username, firstName, lastName, password) => {
        const userData = await api.signup(username, firstName, lastName, password);
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    const value = { user, login, signup, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext); 