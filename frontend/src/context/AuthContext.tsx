import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { UserDTO, UserRole } from '../types/auth.types';
import TokenService from '../services/TokenService'; // From previous implementation

interface AuthContextType {
    user: UserDTO | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Check token validity
                if (TokenService.isTokenExpired(token)) {
                    throw new Error('Token expired');
                }

                const currentUser = await authApi.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                // If token is invalid, clear it
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await authApi.login({ username, password });

            // Store token
            localStorage.setItem('token', response.token);

            // Set user with role
            setUser(response.user);
            return true;
        } catch (error) {
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            setIsLoading(true);
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            setIsLoading(false);
        }
    };

    // Explicit checks for authentication and admin status
    const isAuthenticated = !!user;
    const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;

    const value = {
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};