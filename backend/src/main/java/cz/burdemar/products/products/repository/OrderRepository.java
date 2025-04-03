package cz.burdemar.products.products.repository;

import cz.burdemar.products.products.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatusAndExpiryTimeBefore(Order.OrderStatus status, LocalDateTime time);

    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' AND o.expiryTime < :now")
    List<Order> findExpiredOrders(LocalDateTime now);
}