package com.example.learning.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Learning project")
public record LearningProjectDto(
        @Schema(description = "Project id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long id,
        @Schema(description = "Project name", example = "Backend Track", requiredMode = Schema.RequiredMode.REQUIRED)
        String name,
        @Schema(description = "Project description", example = "Persistence and API work")
        String description,
        @Schema(description = "Task count", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
        int taskCount,
        @Schema(description = "Done task count", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
        int doneTaskCount,
        @Schema(description = "Creation time", requiredMode = Schema.RequiredMode.REQUIRED)
        LocalDateTime createdAt,
        @Schema(description = "Last update time", requiredMode = Schema.RequiredMode.REQUIRED)
        LocalDateTime updatedAt
) {
}
