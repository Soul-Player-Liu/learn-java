package com.example.learning.interfaces.rest;

import com.example.learning.domain.model.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Update learning task request")
public record UpdateLearningTaskRequest(
        @Schema(description = "Project id", example = "1")
        Long projectId,

        @Schema(description = "Task title", example = "Learn MyBatis result maps", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        @Size(max = 100)
        String title,

        @Schema(description = "Task description", example = "Refine mapper XML query examples")
        @Size(max = 500)
        String description,

        @Schema(description = "Task status", example = "TODO", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull
        TaskStatus status,

        @Schema(description = "Due date", example = "2026-05-10")
        LocalDate dueDate,

        @Schema(description = "Tag names", example = "[\"backend\", \"sql\"]")
        List<@Size(max = 30) String> tagNames
) {
}
