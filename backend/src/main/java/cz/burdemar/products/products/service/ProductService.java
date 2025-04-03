package cz.burdemar.products.products.service;

import cz.burdemar.products.products.dto.ProductDTO;
import cz.burdemar.products.products.exception.ResourceNotFoundException;
import cz.burdemar.products.products.model.Order;
import cz.burdemar.products.products.model.OrderItem;
import cz.burdemar.products.products.model.Product;
import cz.burdemar.products.products.repository.OrderRepository;
import cz.burdemar.products.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = Product.builder()
                .name(productDTO.getName())
                .price(productDTO.getPrice())
                .stockQuantity(productDTO.getStockQuantity())
                .build();

        Product savedProduct = productRepository.save(product);
        return toDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setName(productDTO.getName());
        product.setPrice(productDTO.getPrice());
        product.setStockQuantity(productDTO.getStockQuantity());

        Product updatedProduct = productRepository.save(product);
        return toDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Check if the product is referenced in any active orders
        boolean isProductInActiveOrder = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.PENDING || order.getStatus() == Order.OrderStatus.PAID)
                .flatMap(order -> order.getItems().stream())
                .anyMatch(item -> item.getProduct().getId().equals(id));

        if (isProductInActiveOrder) {
            throw new IllegalStateException("Cannot delete product as it is referenced in active orders");
        }

        productRepository.delete(product);
    }

    /**
     * Fetches products with a pessimistic lock to prevent concurrent modifications.
     * This method should be called within a transaction.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Map<Long, Product> getProductsWithLockByIds(List<Long> productIds) {
        return productIds.stream()
                .map(id -> productRepository.findWithLockById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id)))
                .collect(Collectors.toMap(Product::getId, Function.identity()));
    }

    /**
     * Alternative approach for reserving stock with built-in locking.
     * This method handles both fetching with locks and updating in one transaction.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void reserveStockWithLocking(List<OrderItem> orderItems) {
        Map<Long, Product> lockedProducts = orderItems.stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .map(id -> productRepository.findWithLockById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id)))
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        for (OrderItem item : orderItems) {
            Product product = lockedProducts.get(item.getProduct().getId());

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getStockQuantity() + ", Required: " + item.getQuantity());
            }

            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }
    }

    /**
     * Releases stock for the given order items.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void releaseStock(List<OrderItem> orderItems) {
        // First get all products with lock to prevent concurrent modifications
        Map<Long, Product> lockedProducts = orderItems.stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .map(id -> productRepository.findWithLockById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id)))
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        for (OrderItem item : orderItems) {
            Product product = lockedProducts.get(item.getProduct().getId());
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
    }

    private ProductDTO toDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .build();
    }
}