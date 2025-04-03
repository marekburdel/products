package cz.burdemar.products.products.service;

import cz.burdemar.products.products.dto.CreateOrderRequest;
import cz.burdemar.products.products.dto.OrderDTO;
import cz.burdemar.products.products.dto.OrderItemDTO;
import cz.burdemar.products.products.exception.ResourceNotFoundException;
import cz.burdemar.products.products.model.Order;
import cz.burdemar.products.products.model.OrderItem;
import cz.burdemar.products.products.model.Product;
import cz.burdemar.products.products.repository.OrderRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductService productService;

    private static final int ORDER_EXPIRY_MINUTES = 30;

    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        // Get all product IDs from the request
        List<Long> productIds = request.getItems().stream()
                .map(CreateOrderRequest.OrderItemRequest::getProductId)
                .collect(Collectors.toList());

        // Get all products with lock to prevent concurrent modification
        Map<Long, Product> productsMap = productService.getProductsWithLockByIds(productIds);

        // Create order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productsMap.get(itemRequest.getProductId());

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())
                    .build();

            orderItems.add(orderItem);
        }

        // Reserve stock
        productService.reserveStockWithLocking(orderItems);

        // Create and save order
        LocalDateTime now = LocalDateTime.now();
        Order order = Order.builder()
                .status(Order.OrderStatus.PENDING)
                .createdAt(now)
                .expiryTime(now.plusMinutes(ORDER_EXPIRY_MINUTES))
                .build();

        // Add items to order
        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        // Calculate total amount
        order.calculateTotalAmount();

        Order savedOrder = orderRepository.save(order);
        return toDTO(savedOrder);
    }

    @Transactional
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        return toDTO(order);
    }

    @Transactional
    public OrderDTO payOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // Check if order is in PENDING status
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalStateException("Cannot pay for an order that is not in PENDING status");
        }

        // Check if order is expired
        if (order.getExpiryTime().isBefore(LocalDateTime.now())) {
            // Automatically expire the order
            expireOrder(order);
            throw new IllegalStateException("Cannot pay for an expired order");
        }

        // Update order status
        order.setStatus(Order.OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);
        return toDTO(savedOrder);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // Check if order can be canceled
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalStateException("Cannot cancel an order that is not in PENDING status");
        }

        // Update order status
        order.setStatus(Order.OrderStatus.CANCELED);
        order.setCanceledAt(LocalDateTime.now());

        // Release reserved stock
        productService.releaseStock(order.getItems());

        Order savedOrder = orderRepository.save(order);
        return toDTO(savedOrder);
    }

    @Transactional
    public void processExpiredOrders() {
        List<Order> expiredOrders = orderRepository.findExpiredOrders(LocalDateTime.now());

        for (Order order : expiredOrders) {
            expireOrder(order);
        }
    }

    @Transactional
    public void expireOrder(Order order) {
        order.setStatus(Order.OrderStatus.EXPIRED);
        orderRepository.save(order);

        // Release reserved stock
        productService.releaseStock(order.getItems());
    }

    private OrderDTO toDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> OrderItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return OrderDTO.builder()
                .id(order.getId())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .expiryTime(order.getExpiryTime())
                .paidAt(order.getPaidAt())
                .canceledAt(order.getCanceledAt())
                .totalAmount(order.getTotalAmount())
                .items(itemDTOs)
                .build();
    }
}