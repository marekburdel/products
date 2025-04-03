package cz.burdemar.products.products.dto;

import cz.burdemar.products.products.model.Order;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    @Schema(description = "Unique identifier of the order", example = "1")
    private Long id;
    private Order.OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expiryTime;
    private LocalDateTime paidAt;
    private LocalDateTime canceledAt;
    private BigDecimal totalAmount;
    private List<OrderItemDTO> items;
}