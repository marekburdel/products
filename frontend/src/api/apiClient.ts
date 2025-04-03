import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    sub: string;
    roles: string[];
    exp: number;
}
/**
 * API Client for handling HTTP requests
 * Provides a centralized way to make API calls with error handling and authentication
 */
class ApiClient {
    private client: AxiosInstance;
    private readonly baseURL: string;
    private cachedRoles: string[] = [];


    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor for auth tokens
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                // Existing error handling logic...
                if (error.response?.status === 401) {
                    this.removeToken();
                    this.clearCachedRoles();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );

        // Add response interceptor for common error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                // Extract error message
                let errorMessage = 'An unexpected error occurred';

                if (error.response) {
                    // Try to get the error message from the response
                    if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }

                    // Attach the message to the error object so it can be used elsewhere
                    error.displayMessage = errorMessage;

                    // Log based on error code
                    if (error.response.status === 401) {
                        localStorage.removeItem('token');
                        console.error('Unauthorized:', errorMessage);
                    } else if (error.response.status === 403) {
                        console.error('Access denied:', errorMessage);
                    } else if (error.response.status === 404) {
                        console.error('Resource not found:', errorMessage);
                    } else if (error.response.status === 400 || error.response.status === 422) {
                        console.error('Validation error:', errorMessage);
                    } else if (error.response.status >= 500) {
                        console.error('Server error:', errorMessage);
                    }
                } else if (error.request) {
                    error.displayMessage = 'Network error - no response received';
                    console.error('Network error - no response received:', error.request);
                } else {
                    error.displayMessage = error.message || 'Error setting up request';
                    console.error('Error setting up request:', error.message);
                }

                return Promise.reject(error);
            }
        );
    }

    public getToken(): string | null {
        return localStorage.getItem('token');
    }

    public removeToken(): void {
        localStorage.removeItem('token');
        this.clearCachedRoles();
    }

    // Role Management Methods
    private cacheRoles(token: string): void {
        try {
            const decoded = jwtDecode<TokenPayload>(token);
            this.cachedRoles = decoded.roles || [];
        } catch (error) {
            console.error('Error decoding token', error);
            this.cachedRoles = [];
        }
    }

    public getRoles(): string[] {
        // If no cached roles, try to decode from existing token
        if (this.cachedRoles.length === 0) {
            const token = this.getToken();
            if (token) {
                this.cacheRoles(token);
            }
        }
        return this.cachedRoles;
    }

    public hasRole(role: string): boolean {
        return this.getRoles().includes(role);
    }

    private clearCachedRoles(): void {
        this.cachedRoles = [];
    }

    /**
     * Make a GET request
     * @param url The URL to fetch
     * @param config Optional Axios config
     * @returns Promise with the response data
     */
    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get<T>(url, config);
        return response.data;
    }

    /**
     * Make a POST request
     * @param url The URL to post to
     * @param data The data to send
     * @param config Optional Axios config
     * @returns Promise with the response data
     */
    public async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.post<T>(url, data, config);
        return response.data;
    }

    /**
     * Make a PUT request
     * @param url The URL to put to
     * @param data The data to send
     * @param config Optional Axios config
     * @returns Promise with the response data
     */
    public async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.put<T>(url, data, config);
        return response.data;
    }

    /**
     * Make a PATCH request
     * @param url The URL to patch
     * @param data The data to send
     * @param config Optional Axios config
     * @returns Promise with the response data
     */
    public async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    /**
     * Make a DELETE request
     * @param url The URL to delete from
     * @param config Optional Axios config
     * @returns Promise with the response data
     */
    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.delete<T>(url, config);
        return response.data;
    }
}

// Export a singleton instance
export default new ApiClient();