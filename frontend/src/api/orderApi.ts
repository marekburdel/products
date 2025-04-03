import apiClient from './apiClient';
import { OrderDTO, CreateOrderRequest } from '../types/order.types';

/**
 * API service for order-related operations
 */
export const orderApi = {
    /**
     * Get all orders
     * @returns Promise with array of orders
     */
    getAllOrders: async (): Promise<OrderDTO[]> => {
        return apiClient.get<OrderDTO[]>('/api/orders');
    },

    /**
     * Get an order by ID
     * @param id The order ID
     * @returns Promise with the order data
     */
    getOrderById: async (id: number): Promise<OrderDTO> => {
        return apiClient.get<OrderDTO>(`/api/orders/${id}`);
    },

    /**
     * Create a new order
     * @param request The order request data
     * @returns Promise with the created order
     */
    createOrder: async (request: CreateOrderRequest): Promise<OrderDTO> => {
        return apiClient.post<OrderDTO>('/api/orders', request);
    },

    /**
     * Mark an order as paid
     * @param id The ID of the order to mark as paid
     * @returns Promise with the updated order
     */
    payOrder: async (id: number): Promise<OrderDTO> => {
        return apiClient.post<OrderDTO>(`/api/orders/${id}/pay`);
    },

    /**
     * Cancel an order
     * @param id The ID of the order to cancel
     * @returns Promise with the updated order
     */
    cancelOrder: async (id: number): Promise<OrderDTO> => {
        return apiClient.post<OrderDTO>(`/api/orders/${id}/cancel`);
    }
};