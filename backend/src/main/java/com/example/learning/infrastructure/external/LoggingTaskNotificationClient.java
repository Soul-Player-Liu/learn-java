package com.example.learning.infrastructure.external;

import com.example.learning.application.port.TaskNotificationClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LoggingTaskNotificationClient implements TaskNotificationClient {

    @Override
    public void taskCreated(Long taskId, String title, String taskCode) {
        log.info("External task notification taskId={} title={} taskCode={}", taskId, title, taskCode);
    }
}
