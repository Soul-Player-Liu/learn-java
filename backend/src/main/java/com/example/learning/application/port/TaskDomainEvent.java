package com.example.learning.application.port;

import java.util.Map;

public record TaskDomainEvent(String type, Long taskId, String taskCode, Map<String, String> attributes) {

    public static TaskDomainEvent taskCreated(Long taskId, String taskCode, String title, String archiveId) {
        return new TaskDomainEvent("TASK_CREATED", taskId, taskCode, Map.of(
                "title", title,
                "archiveId", archiveId == null ? "" : archiveId
        ));
    }

    public static TaskDomainEvent taskStatusChanged(Long taskId, String status) {
        return new TaskDomainEvent("TASK_STATUS_CHANGED", taskId, null, Map.of("status", status));
    }

    public static TaskDomainEvent taskCommentAdded(Long taskId, String author) {
        return new TaskDomainEvent("TASK_COMMENT_ADDED", taskId, null, Map.of("author", author));
    }
}
