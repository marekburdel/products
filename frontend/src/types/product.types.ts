/**
 * Product Data Transfer Object
 * Represents a product in the system
 */
export interface ProductDTO {
    /**
     * The unique identifier for the product
     * Optional as it may not be present when creating a new product
     */
    id?: number;

    /**
     * The name of the product
     */
    name: string;

    /**
     * The description of the product
     * Optional as some products may not have a description
     */
    description?: string;

    /**
     * The price of the product
     */
    price: number;

    /**
     * The available quantity in stock
     */
    stockQuantity: number;

    /**
     * The product category
     * Optional as it might not be required in all operations
     */
    category?: string;

    /**
     * Whether the product is active (available for purchase)
     * Optional with a default of true for new products
     */
    active?: boolean;

    /**
     * The date when the product was created
     * Optional as it's typically set by the backend
     */
    createdAt?: string;

    /**
     * The date when the product was last updated
     * Optional as it's typically set by the backend
     */
    updatedAt?: string;
}

/**
 * Product Filter Options
 * Used for filtering products in list views
 */
export interface ProductFilterOptions {
    /**
     * Filter by product name or partial name
     */
    name?: string;

    /**
     * Filter by product category
     */
    category?: string;

    /**
     * Filter by minimum price
     */
    minPrice?: number;

    /**
     * Filter by maximum price
     */
    maxPrice?: number;

    /**
     * Filter by stock availability
     */
    inStock?: boolean;

    /**
     * Filter by active status
     */
    active?: boolean;
}