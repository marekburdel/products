package cz.burdemar.products.products.config;

import cz.burdemar.products.products.model.Product;
import cz.burdemar.products.products.model.User;
import cz.burdemar.products.products.model.UserRole;
import cz.burdemar.products.products.repository.ProductRepository;
import cz.burdemar.products.products.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    @Profile("!test") // Don't run this in test profile
    public CommandLineRunner initData() {
        return args -> {
            // Create admin user if not exists
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setEmail("admin@example.com");
                admin.setRole(UserRole.ROLE_ADMIN);
                admin.setEnabled(true);

                userRepository.save(admin);

                System.out.println("Admin user created");
            }

            if (productRepository.count() == 0) {
                log.info("Initializing sample products...");

                List<Product> products = Arrays.asList(
                        Product.builder()
                                .name("Laptop")
                                .price(new BigDecimal("1299.99"))
                                .stockQuantity(10)
                                .build(),
                        Product.builder()
                                .name("Smartphone")
                                .price(new BigDecimal("799.99"))
                                .stockQuantity(20)
                                .build(),
                        Product.builder()
                                .name("Headphones")
                                .price(new BigDecimal("199.99"))
                                .stockQuantity(30)
                                .build(),
                        Product.builder()
                                .name("Tablet")
                                .price(new BigDecimal("499.99"))
                                .stockQuantity(15)
                                .build(),
                        Product.builder()
                                .name("Smartwatch")
                                .price(new BigDecimal("299.99"))
                                .stockQuantity(25)
                                .build()
                );

                productRepository.saveAll(products);
                log.info("Sample products initialized!");
            }
        };
    }
}
