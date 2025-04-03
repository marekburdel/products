import apiClient from './apiClient';
import { ProductDTO, ProductFilterOptions } from '../types/product.types';

/**
 * API service for product-related operations
 */
export const productApi = {
    /**
     * Get all products
     * @param filters Optional filters to apply to the product list
     * @returns Promise with array of products
     */
    getAllProducts: async (filters?: ProductFilterOptions): Promise<ProductDTO[]> => {
        // Convert filters to query parameters if provided
        let queryParams = '';
        if (filters) {
            const params = new URLSearchParams();
            if (filters.name) params.append('name', filters.name);
            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
            if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());
            if (filters.active !== undefined) params.append('active', filters.active.toString());

            queryParams = `?${params.toString()}`;
        }

        return apiClient.get<ProductDTO[]>(`/api/products${queryParams}`);
    },

    /**
     * Get a product by ID
     * @param id The product ID
     * @returns Promise with the product data
     */
    getProductById: async (id: number): Promise<ProductDTO> => {
        return apiClient.get<ProductDTO>(`/api/products/${id}`);
    },

    /**
     * Create a new product
     * @param product The product data to create
     * @returns Promise with the created product
     */
    createProduct: async (product: ProductDTO): Promise<ProductDTO> => {
        return apiClient.post<ProductDTO>('/api/products', product);
    },

    /**
     * Update an existing product
     * @param id The ID of the product to update
     * @param product The updated product data
     * @returns Promise with the updated product
     */
    updateProduct: async (id: number, product: ProductDTO): Promise<ProductDTO> => {
        return apiClient.put<ProductDTO>(`/api/products/${id}`, product);
    },

    /**
     * Delete a product
     * @param id The ID of the product to delete
     * @returns Promise with no content
     */
    deleteProduct: async (id: number): Promise<void> => {
        return apiClient.delete<void>(`/api/products/${id}`);
    },

    /**
     * Search products by keyword
     * @param keyword The search term
     * @returns Promise with array of matching products
     */
    searchProducts: async (keyword: string): Promise<ProductDTO[]> => {
        return apiClient.get<ProductDTO[]>(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
    },

    /**
     * Get products by category
     * @param category The category name
     * @returns Promise with array of products in the category
     */
    getProductsByCategory: async (category: string): Promise<ProductDTO[]> => {
        return apiClient.get<ProductDTO[]>(`/api/products/category/${encodeURIComponent(category)}`);
    },

    /**
     * Get products that are low in stock
     * @param threshold The threshold quantity (default: 10)
     * @returns Promise with array of products below the threshold
     */
    getLowStockProducts: async (threshold: number = 10): Promise<ProductDTO[]> => {
        return apiClient.get<ProductDTO[]>(`/api/products/low-stock?threshold=${threshold}`);
    }
};