package cz.burdemar.products.products.service;

import cz.burdemar.products.products.dto.ProductDTO;
import cz.burdemar.products.products.exception.ResourceNotFoundException;
import cz.burdemar.products.products.model.Order;
import cz.burdemar.products.products.model.OrderItem;
import cz.burdemar.products.products.model.Product;
import cz.burdemar.products.products.repository.OrderRepository;
import cz.burdemar.products.products.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private ProductDTO testProductDTO;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(new BigDecimal("99.99"))
                .stockQuantity(10)
                .build();

        testProductDTO = ProductDTO.builder()
                .id(1L)
                .name("Test Product")
                .price(new BigDecimal("99.99"))
                .stockQuantity(10)
                .build();
    }

    @Test
    void getAllProducts_ShouldReturnAllProducts() {
        when(productRepository.findAll()).thenReturn(Arrays.asList(testProduct));

        List<ProductDTO> result = productService.getAllProducts();

        assertEquals(1, result.size());
        assertEquals(testProduct.getId(), result.get(0).getId());
        assertEquals(testProduct.getName(), result.get(0).getName());
    }

    @Test
    void getProductById_WithValidId_ShouldReturnProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        ProductDTO result = productService.getProductById(1L);

        assertEquals(testProduct.getId(), result.getId());
        assertEquals(testProduct.getName(), result.getName());
    }

    @Test
    void getProductById_WithInvalidId_ShouldThrowException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            productService.getProductById(999L);
        });
    }

    @Test
    void createProduct_ShouldReturnCreatedProduct() {
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        ProductDTO result = productService.createProduct(testProductDTO);

        assertEquals(testProduct.getId(), result.getId());
        assertEquals(testProduct.getName(), result.getName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void updateProduct_WithValidId_ShouldReturnUpdatedProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        ProductDTO updatedDTO = testProductDTO;
        updatedDTO.setName("Updated Name");
        updatedDTO.setPrice(new BigDecimal("199.99"));

        ProductDTO result = productService.updateProduct(1L, updatedDTO);

        assertEquals(testProduct.getId(), result.getId());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void deleteProduct_WithValidIdAndNoActiveOrders_ShouldDeleteProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(orderRepository.findAll()).thenReturn(new ArrayList<>());

        assertDoesNotThrow(() -> productService.deleteProduct(1L));
        verify(productRepository, times(1)).delete(any(Product.class));
    }

    @Test
    void deleteProduct_WithActiveOrders_ShouldThrowException() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        Order activeOrder = new Order();
        activeOrder.setStatus(Order.OrderStatus.PENDING);

        OrderItem orderItem = new OrderItem();
        orderItem.setProduct(testProduct);

        List<OrderItem> items = new ArrayList<>();
        items.add(orderItem);
        activeOrder.setItems(items);

        List<Order> orders = new ArrayList<>();
        orders.add(activeOrder);

        when(orderRepository.findAll()).thenReturn(orders);

        assertThrows(IllegalStateException.class, () -> {
            productService.deleteProduct(1L);
        });
        verify(productRepository, never()).delete(any(Product.class));
    }
}