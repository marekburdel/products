package cz.burdemar.products.products.scheduler;

import cz.burdemar.products.products.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderExpiryScheduler {
    private final OrderService orderService;

    // Run every minute to check for expired orders
    @Scheduled(fixedRate = 60000)
    public void checkExpiredOrders() {
        log.info("Checking for expired orders...");
        orderService.processExpiredOrders();
    }
}