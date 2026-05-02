package com.example.learning.application.dto;

import com.example.learning.infrastructure.persistence.TaskActivityRecord;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Task activity")
public record TaskActivityDto(
        @Schema(description = "Activity id", example = "1")
        Long id,
        @Schema(description = "Task id", example = "10")
        Long taskId,
        @Schema(description = "Activity type", example = "TASK_CREATED")
        String type,
        @Schema(description = "Activity message", example = "创建了任务")
        String message,
        @Schema(description = "Creation time")
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
