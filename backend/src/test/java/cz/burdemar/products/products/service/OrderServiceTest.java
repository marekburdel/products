package cz.burdemar.products.products.service;

import cz.burdemar.products.products.dto.CreateOrderRequest;
import cz.burdemar.products.products.dto.OrderDTO;
import cz.burdemar.products.products.exception.ResourceNotFoundException;
import cz.burdemar.products.products.model.Order;
import cz.burdemar.products.products.model.OrderItem;
import cz.burdemar.products.products.model.Product;
import cz.burdemar.products.products.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;
    private Product testProduct;
    private OrderItem testOrderItem;
    private CreateOrderRequest testCreateOrderRequest;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(new BigDecimal("99.99"))
                .stockQuantity(10)
                .build();

        testOrderItem = OrderItem.builder()
                .id(1L)
                .product(testProduct)
                .quantity(2)
                .price(testProduct.getPrice())
                .build();

        testOrder = Order.builder()
                .id(1L)
                .status(Order.OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .expiryTime(LocalDateTime.now().plusMinutes(30))
                .totalAmount(new BigDecimal("199.98"))
                .build();
        testOrderItem.setOrder(testOrder);
        testOrder.getItems().add(testOrderItem);

        CreateOrderRequest.OrderItemRequest itemRequest = new CreateOrderRequest.OrderItemRequest();
        itemRequest.setProductId(1L);
        itemRequest.setQuantity(2);

        testCreateOrderRequest = new CreateOrderRequest();
        testCreateOrderRequest.setItems(Collections.singletonList(itemRequest));
    }

    @Test
    void getOrderById_WithValidId_ShouldReturnOrder() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        OrderDTO result = orderService.getOrderById(1L);

        assertNotNull(result);
        assertEquals(testOrder.getId(), result.getId());
    }

    @Test
    void getOrderById_WithInvalidId_ShouldThrowException() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.getOrderById(999L);
        });
    }

    @Test
    void payOrder_WithValidPendingOrder_ShouldReturnPaidOrder() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        testOrder.setExpiryTime(LocalDateTime.now().plusMinutes(10)); // Not expired

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setStatus(Order.OrderStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
            return order;
        });

        OrderDTO result = orderService.payOrder(1L);

        assertNotNull(result);
        assertEquals(Order.OrderStatus.PAID, result.getStatus());
        assertNotNull(result.getPaidAt());
    }

    @Test
    void payOrder_WithExpiredOrder_ShouldThrowException() {
        Order expiredOrder = testOrder;
        expiredOrder.setExpiryTime(LocalDateTime.now().minusMinutes(10)); // Expired

        when(orderRepository.findById(1L)).thenReturn(Optional.of(expiredOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(expiredOrder);

        assertThrows(IllegalStateException.class, () -> {
            orderService.payOrder(1L);
        });
    }

    @Test
    void cancelOrder_WithValidPendingOrder_ShouldReturnCanceledOrder() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        doNothing().when(productService).releaseStock(anyList());

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setStatus(Order.OrderStatus.CANCELED);
            order.setCanceledAt(LocalDateTime.now());
            return order;
        });

        OrderDTO result = orderService.cancelOrder(1L);

        assertNotNull(result);
        assertEquals(Order.OrderStatus.CANCELED, result.getStatus());
        assertNotNull(result.getCanceledAt());
        verify(productService, times(1)).releaseStock(anyList());
    }

    @Test
    void cancelOrder_WithNonPendingOrder_ShouldThrowException() {
        Order paidOrder = testOrder;
        paidOrder.setStatus(Order.OrderStatus.PAID);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(paidOrder));

        assertThrows(IllegalStateException.class, () -> {
            orderService.cancelOrder(1L);
        });
        verify(productService, never()).releaseStock(anyList());
    }

    @Test
    void processExpiredOrders_ShouldExpireOrders() {
        List<Order> expiredOrders = Collections.singletonList(testOrder);
        when(orderRepository.findExpiredOrders(any(LocalDateTime.class))).thenReturn(expiredOrders);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        doNothing().when(productService).releaseStock(anyList());

        orderService.processExpiredOrders();

        verify(orderRepository, times(1)).save(any(Order.class));
        verify(productService, times(1)).releaseStock(anyList());
    }
}