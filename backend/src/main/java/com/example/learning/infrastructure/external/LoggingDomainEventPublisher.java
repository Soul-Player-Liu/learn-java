package com.example.learning.infrastructure.external;

import com.example.learning.application.port.DomainEventPublisher;
import com.example.learning.application.port.TaskDomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LoggingDomainEventPublisher implements DomainEventPublisher {

    @Override
    public void publish(TaskDomainEvent event) {
        log.info("Published local domain event type={} taskId={} attributes={}",
                event.type(), event.taskId(), event.attributes());
    }
}
