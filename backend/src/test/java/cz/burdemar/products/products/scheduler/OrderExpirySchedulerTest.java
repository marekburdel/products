package cz.burdemar.products.products.scheduler;

import cz.burdemar.products.products.service.OrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OrderExpirySchedulerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderExpiryScheduler orderExpiryScheduler;

    @Test
    void checkExpiredOrders_ShouldCallProcessExpiredOrders() {
        orderExpiryScheduler.checkExpiredOrders();
        verify(orderService, times(1)).processExpiredOrders();
    }
}