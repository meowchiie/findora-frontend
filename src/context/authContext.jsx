import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Ambil data user dari localStorage jika sudah pernah login
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    );

    // Fungsi untuk menyimpan sesi setelah login berhasil
    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Fungsi untuk menghapus sesi saat logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};