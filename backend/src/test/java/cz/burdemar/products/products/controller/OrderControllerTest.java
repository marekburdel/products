package cz.burdemar.products.products.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.burdemar.products.products.dto.CreateOrderRequest;
import cz.burdemar.products.products.dto.OrderDTO;
import cz.burdemar.products.products.filter.JwtRequestFilter;
import cz.burdemar.products.products.jwt.JwtTokenUtil;
import cz.burdemar.products.products.model.Order;
import cz.burdemar.products.products.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private JwtRequestFilter jwtRequestFilter;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private cz.burdemar.products.products.jwt.JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    private OrderDTO sampleOrder;
    private CreateOrderRequest createOrderRequest;

    @BeforeEach
    void setUp() {
        // Clear security context before each test
        SecurityContextHolder.clearContext();

        // Create sample order DTO
        sampleOrder = OrderDTO.builder()
                .id(1L)
                .totalAmount(new BigDecimal("99.99"))
                .status(Order.OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .items(Collections.emptyList())
                .build();

        // Create sample order request
        CreateOrderRequest.OrderItemRequest itemRequest = new CreateOrderRequest.OrderItemRequest();
        itemRequest.setProductId(1L);
        itemRequest.setQuantity(2);

        createOrderRequest = new CreateOrderRequest();
        createOrderRequest.setItems(Collections.singletonList(itemRequest));
    }

    private void setupUserWithRole(String role) {
        UserDetails userDetails = new User("testuser", "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void adminCanAccessAllEndpoints() throws Exception {
        when(orderService.getAllOrders()).thenReturn(Collections.singletonList(sampleOrder));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk());
    }

    @Test
    public void testWithJwtAuthentication() throws Exception {
        UserDetails userDetails = new User("testuser", "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

        when(jwtTokenUtil.getUsernameFromToken("test-token")).thenReturn("testuser");
        when(jwtTokenUtil.getRolesFromToken("test-token")).thenReturn(Collections.singletonList("USER"));
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);

        when(orderService.getOrderById(anyLong())).thenReturn(sampleOrder);

        mockMvc.perform(get("/api/orders/1")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk());
    }
}