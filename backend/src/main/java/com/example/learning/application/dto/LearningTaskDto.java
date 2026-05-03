package com.example.learning.application.dto;

import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.model.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Learning task detail")
public record LearningTaskDto(
        @Schema(description = "Task id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long id,
        @Schema(description = "Project id", example = "10")
        Long projectId,
        @Schema(description = "Project name", example = "Backend Track")
        String projectName,
        @Schema(description = "Task title", example = "Learn REST controllers", requiredMode = Schema.RequiredMode.REQUIRED)
        String title,
        @Schema(description = "Task description", example = "Read and test controller code")
        String description,
        @Schema(description = "Task status", example = "TODO", requiredMode = Schema.RequiredMode.REQUIRED)
        TaskStatus status,
        @Schema(description = "Due date", example = "2026-05-10")
        LocalDate dueDate,
        @Schema(description = "Tag names", requiredMode = Schema.RequiredMode.REQUIRED)
        List<String> tagNames,
        @Schema(description = "Creation time", requiredMode = Schema.RequiredMode.REQUIRED)
        LocalDateTime createdAt,
        @Schema(description = "Last update time", requiredMode = Schema.RequiredMode.REQUIRED)
        LocalDateTime updatedAt
) {

    public static LearningTaskDto from(LearningTask task) {
        return from(task, null, List.of());
    }

    public static LearningTaskDto from(LearningTask task, String projectName, List<String> tagNames) {
        return new LearningTaskDto(
                task.getId(),
                task.getProjectId(),
                projectName,
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueDate(),
                tagNames == null ? List.of() : tagNames,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
