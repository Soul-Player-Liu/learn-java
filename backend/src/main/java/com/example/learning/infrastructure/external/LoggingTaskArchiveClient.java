package com.example.learning.infrastructure.external;

import com.example.learning.application.port.ArchivedTaskBrief;
import com.example.learning.application.port.TaskArchiveClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LoggingTaskArchiveClient implements TaskArchiveClient {

    @Override
    public ArchivedTaskBrief archiveTaskBrief(Long taskId, String title, String description) {
        String archiveId = "local-task-brief-" + taskId;
        String location = "local://task-brief/" + taskId;
        log.info("Archived task brief archiveId={} title={}", archiveId, title);
        return new ArchivedTaskBrief(archiveId, location);
    }
}
