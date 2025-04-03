import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';
import { ProductDTO, ProductFilterOptions } from '../types/product.types';

/**
 * Custom hook for managing products
 * Provides methods for fetching, creating, updating, and deleting products
 */
export const useProducts = () => {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch all products from the API
     * @param filters Optional filters to apply to the product list
     */
    const fetchProducts = useCallback(async (filters?: ProductFilterOptions) => {
        setLoading(true);
        setError(null);
        try {
            const data = await productApi.getAllProducts(filters);
            setProducts(data);
            return data;
        } catch (err) {
            setError('Failed to fetch products');
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Load products on initial mount
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    /**
     * Get a single product by ID
     * @param id The product ID to fetch
     */
    const getProduct = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            return await productApi.getProductById(id);
        } catch (err) {
            setError('Failed to fetch product');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Create a new product
     * @param product The product data to create
     */
    const createProduct = useCallback(async (product: ProductDTO) => {
        setLoading(true);
        setError(null);
        try {
            const newProduct = await productApi.createProduct(product);
            setProducts(prev => [...prev, newProduct]);
            return newProduct;
        } catch (err) {
            setError('Failed to create product');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update an existing product
     * @param id The ID of the product to update
     * @param product The updated product data
     */
    const updateProduct = useCallback(async (id: number, product: ProductDTO) => {
        setLoading(true);
        setError(null);
        try {
            const updatedProduct = await productApi.updateProduct(id, product);
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
            return updatedProduct;
        } catch (err) {
            setError('Failed to update product');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete a product by ID
     * @param id The ID of the product to delete
     */
    const deleteProduct = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await productApi.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (err) {
            setError('Failed to delete product');
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
        products,
        loading,
        error,
        fetchProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        clearError
    };
};