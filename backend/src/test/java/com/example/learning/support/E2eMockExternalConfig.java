package com.example.learning.support;

import com.example.learning.application.port.TaskNotificationClient;
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
}
