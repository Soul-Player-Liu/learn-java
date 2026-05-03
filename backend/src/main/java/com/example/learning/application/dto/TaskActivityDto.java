package com.example.learning.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Task activity")
public record TaskActivityDto(
        @Schema(description = "Activity id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long id,
        @Schema(description = "Task id", example = "10", requiredMode = Schema.RequiredMode.REQUIRED)
        Long taskId,
        @Schema(description = "Activity type", example = "TASK_CREATED", requiredMode = Schema.RequiredMode.REQUIRED)
        String type,
        @Schema(description = "Activity message", example = "创建了任务", requiredMode = Schema.RequiredMode.REQUIRED)
        String message,
        @Schema(description = "Creation time", requiredMode = Schema.RequiredMode.REQUIRED)
        LocalDateTime createdAt
) {
}
