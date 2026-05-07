package com.example.learning.support;

import com.example.learning.application.port.DomainEventPublisher;
import com.example.learning.application.port.TaskArchiveClient;
import com.example.learning.application.port.TaskCodeGenerator;
import com.example.learning.application.port.TaskNotificationClient;
import com.example.learning.application.port.TaskRiskClient;
import com.example.learning.application.port.UserDirectoryClient;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class E2eMockExternalConfig {

    @Bean
    @Primary
    public TaskNotificationClient taskNotificationClient() {
        return Mockito.mock(TaskNotificationClient.class);
    }

    @Bean
    @Primary
    public UserDirectoryClient userDirectoryClient() {
        return Mockito.mock(UserDirectoryClient.class);
    }

    @Bean
    @Primary
    public TaskRiskClient taskRiskClient() {
        return Mockito.mock(TaskRiskClient.class);
    }

    @Bean
    @Primary
    public DomainEventPublisher domainEventPublisher() {
        return Mockito.mock(DomainEventPublisher.class);
    }

    @Bean
    @Primary
    public TaskCodeGenerator taskCodeGenerator() {
        return Mockito.mock(TaskCodeGenerator.class);
    }

    @Bean
    @Primary
    public TaskArchiveClient taskArchiveClient() {
        return Mockito.mock(TaskArchiveClient.class);
    }
}
