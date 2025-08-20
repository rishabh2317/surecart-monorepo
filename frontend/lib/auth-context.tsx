// lib/auth-context.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveUserSession, getUserSession, clearUserSession } from '@/lib/auth';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseApp } from './firebase'; // Make sure you have this file with your firebase config

const API_BASE_URL = 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'CREATOR' | 'SHOPPER' | 'BRAND';
  profileImageUrl?: string;
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUserSession: (newUser: User) => void;
  isAuthModalOpen: boolean;
  openAuthModal: (redirectPath?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const sessionUser = getUserSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
    setLoading(false);
  }, []);

  const handleSuccessfulAuth = (userData: any, isNewUser: boolean = false) => {
    saveUserSession(userData);
    setUser(userData);

    // THIS IS THE FIX: Prioritize the saved redirect path
    if (redirectPath) {
        router.push(redirectPath);
        setRedirectPath(null); // Clear the path after using it
    } else {
        // Fallback to the default role-based routing
        switch (userData.role) {
            case 'CREATOR':
                isNewUser ? router.push('/onboarding') : router.push('/dashboard');
                break;
            case 'BRAND':
                isNewUser ? router.push('/onboarding') : router.push('/dashboard');
                break;
            case 'SHOPPER':
                isNewUser ? router.push('/explore') : router.push('/likes');
                break;
            default:
                router.push('/');
                break;
        }
    }
    
    if (isAuthModalOpen) {
        setAuthModalOpen(false);
    }
  };

  // This is the restored, complete signInWithGoogle function
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        const res = await fetch(`${API_BASE_URL}/auth/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: firebaseUser.email,
                username: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                authProviderId: firebaseUser.uid,
                profileImageUrl: firebaseUser.photoURL,
            }),
        });
        const appUser = await res.json();
        if (!res.ok) throw new Error(appUser.message);

        handleSuccessfulAuth(appUser, true); // Treat all social sign-ins as potentially new users for routing
        
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    handleSuccessfulAuth(data, false);
  };

  const register = async (userData: any) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    handleSuccessfulAuth(data, true);
  };

  const logout = () => {
    clearUserSession();
    setUser(null);
    router.push('/'); 
  };
  
  const updateUserSession = (newUser: any) => {
      saveUserSession(newUser);
      setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, login, register, logout, updateUserSession, isAuthModalOpen, openAuthModal: (path?: string) => {
      if (path) setRedirectPath(path);
      setAuthModalOpen(true);
  }, closeAuthModal: () => setAuthModalOpen(false) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};