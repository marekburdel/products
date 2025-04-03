import apiClient from './apiClient';
import { LoginRequest, LoginResponse, UserDTO, UserRole } from '../types/auth.types';

export const authApi = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);

        // Ensure role is properly set
        if (!response.user.role) {
            console.warn('User role not provided by backend');
            // Fallback or default role if needed
            response.user.role = UserRole.USER;
        }

        return response;
    },

    logout: async (): Promise<void> => {
        return apiClient.post<void>('/api/auth/logout');
    },

    getCurrentUser: async (): Promise<UserDTO> => {
        const user = await apiClient.get<UserDTO>('/api/auth/me');

        // Ensure role is properly set
        if (!user.role) {
            console.warn('User role not provided by backend');
            user.role = UserRole.USER;
        }

        return user;
    }
};