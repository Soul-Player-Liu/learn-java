package com.example.learning.application.port;

public interface DomainEventPublisher {

    void publish(TaskDomainEvent event);
}
