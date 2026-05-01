package com.example.learning.application.dto;

import com.example.learning.infrastructure.persistence.TaskActivityRecord;

import java.time.LocalDateTime;

public record TaskActivityDto(
        Long id,
        Long taskId,
        String type,
        String message,
        LocalDateTime createdAt
) {

    public static TaskActivityDto from(TaskActivityRecord record) {
        return new TaskActivityDto(
                record.getId(),
                record.getTaskId(),
                record.getType(),
                record.getMessage(),
                record.getCreatedAt()
        );
    }
}
