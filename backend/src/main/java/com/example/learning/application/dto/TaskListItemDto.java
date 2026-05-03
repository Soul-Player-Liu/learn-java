package com.example.learning.application.dto;

import com.example.learning.domain.model.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Task summary used by paged task lists")
public record TaskListItemDto(
        @Schema(description = "Task id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long id,

        @Schema(description = "Project id", example = "10")
        Long projectId,

        @Schema(description = "Project name", example = "Backend Track")
        String projectName,

        @Schema(description = "Task title", example = "Learn MyBatis pagination", requiredMode = Schema.RequiredMode.REQUIRED)
        String title,

        @Schema(description = "Task description", example = "Implement a paged multi-table query")
        String description,

        @Schema(description = "Task status", example = "TODO", requiredMode = Schema.RequiredMode.REQUIRED)
        TaskStatus status,

        @Schema(description = "Due date", example = "2026-05-10")
        LocalDate dueDate,

        @Schema(description = "Tag names", requiredMode = Schema.RequiredMode.REQUIRED)
        List<String> tagNames,

        @Schema(description = "Comment count", example = "3", requiredMode = Schema.RequiredMode.REQUIRED)
        long commentCount,

        @Schema(description = "Latest activity time")
        LocalDateTime latestActivityAt,

        @Schema(description = "Creation time", requiredMode = Schema.RequiredMode.REQUIRED)
        LocalDateTime createdAt,

        @Schema(description = "Last update time", requiredMode = Schema.RequiredMode.REQUIRED)
        LocalDateTime updatedAt
) {

    public TaskListItemDto {
        tagNames = tagNames == null ? List.of() : List.copyOf(tagNames);
    }
}
