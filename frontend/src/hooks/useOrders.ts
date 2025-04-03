import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../api/orderApi';
import { OrderDTO, CreateOrderRequest, OrderStatus } from '../types/order.types';

/**
 * Custom hook for managing orders
 * Provides methods for fetching, creating, and updating orders
 */
export const useOrders = () => {
    const [orders, setOrders] = useState<OrderDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch all orders from the API
     */
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await orderApi.getAllOrders();
            setOrders(data);
            return data;
        } catch (err) {
            setError('Failed to fetch orders');
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Load orders on initial mount
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    /**
     * Get a single order by ID
     * @param id The order ID to fetch
     */
    const getOrder = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            return await orderApi.getOrderById(id);
        } catch (err) {
            setError('Failed to fetch order');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Create a new order
     * @param request The order data to create
     */
    const createOrder = useCallback(async (request: CreateOrderRequest) => {
        setLoading(true);
        setError(null);
        try {
            const newOrder = await orderApi.createOrder(request);
            setOrders(prev => [...prev, newOrder]);
            return newOrder;
        } catch (err: any) {
            // Use the error message from the API client
            setError(err.displayMessage || 'Failed to create order');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Mark an order as paid
     * @param id The ID of the order to mark as paid
     */
    const payOrder = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const updatedOrder = await orderApi.payOrder(id);
            setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
            return updatedOrder;
        } catch (err) {
            setError('Failed to pay for order');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Cancel an order
     * @param id The ID of the order to cancel
     */
    const cancelOrder = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const updatedOrder = await orderApi.cancelOrder(id);
            setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
            return updatedOrder;
        } catch (err) {
            setError('Failed to cancel order');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Clear any error messages
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        orders,
        loading,
        error,
        fetchOrders,
        getOrder,
        createOrder,
        payOrder,
        cancelOrder,
        clearError
    };
};