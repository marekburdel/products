/**
 * Order Status Enum
 * Represents the possible states of an order
 */
export enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}

/**
 * Order Item Data Transfer Object
 * Represents a product in an order with its quantity and price
 */
export interface OrderItemDTO {
    /**
     * The ID of the order item
     */
    id: number;

    /**
     * The ID of the product
     */
    productId: number;

    /**
     * The quantity of the product ordered
     */
    quantity: number;

    /**
     * The name of the product (for display purposes)
     */
    productName: string;

    /**
     * The price of the product at the time of ordering
     */
    price: number;

    /**
     * The subtotal for this item (price * quantity)
     */
    subtotal: number;
}

/**
 * Order Data Transfer Object
 * Represents an order in the system
 */
export interface OrderDTO {
    /**
     * The unique identifier for the order
     */
    id: number;

    /**
     * The current status of the order
     */
    status: OrderStatus;

    /**
     * The date and time when the order was created
     */
    createdAt: string;

    /**
     * The date and time when the order reservation expires
     */
    expiryTime: string;

    /**
     * The date and time when the order was paid (if applicable)
     */
    paidAt: string | null;

    /**
     * The date and time when the order was canceled (if applicable)
     */
    canceledAt: string | null;

    /**
     * The total amount for the order
     */
    totalAmount: number;

    /**
     * The items in the order
     */
    items: OrderItemDTO[];

    /**
     * Customer ID (if available)
     */
    customerId?: number;

    /**
     * Customer name (if available)
     */
    customerName?: string;

    /**
     * Customer email (if available)
     */
    customerEmail?: string;
}

/**
 * Create Order Request
 * Contains the data needed to create a new order
 */
export interface CreateOrderRequest {
    /**
     * The items to be included in the order
     */
    items: {
        /**
         * The ID of the product
         */
        productId: number;

        /**
         * The quantity of the product to order
         */
        quantity: number;
    }[];

    /**
     * Customer name for the order (optional)
     */
    customerName?: string;

    /**
     * Customer email for the order (optional)
     */
    customerEmail?: string;

    /**
     * Any notes for the order (optional)
     */
    notes?: string;
}