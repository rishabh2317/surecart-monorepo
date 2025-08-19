// lib/auth.ts
'use client';

export const saveUserSession = (user: { id: string, email: string, username: string }) => {
    localStorage.setItem('surecart_user', JSON.stringify(user));
    
};

export const getUserSession = () => {
    const user = localStorage.getItem('surecart_user');
    return user ? JSON.parse(user) : null;
};

export const clearUserSession = () => {
    localStorage.removeItem('surecart_user');
};