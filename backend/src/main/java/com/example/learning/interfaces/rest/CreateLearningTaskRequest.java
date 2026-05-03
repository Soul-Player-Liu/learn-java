package com.example.learning.interfaces.rest;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Create learning task request")
public record CreateLearningTaskRequest(
        @Schema(description = "Project id", example = "1")
        Long projectId,

        @Schema(description = "Task title", example = "Learn MyBatis pagination", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        @Size(max = 100)
        String title,

        @Schema(description = "Task description", example = "Build count and page queries with mapper XML")
        @Size(max = 500)
        String description,

        @Schema(description = "Due date", example = "2026-05-10")
        LocalDate dueDate,

        @Schema(description = "Tag names", example = "[\"backend\", \"sql\"]")
        List<@Size(max = 30) String> tagNames
) {
}
