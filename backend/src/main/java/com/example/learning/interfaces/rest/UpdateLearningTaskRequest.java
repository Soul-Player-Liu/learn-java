package com.example.learning.interfaces.rest;

import com.example.learning.domain.model.TaskStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record UpdateLearningTaskRequest(
        Long projectId,

        @NotBlank
        @Size(max = 100)
        String title,

        @Size(max = 500)
        String description,

        @NotNull
        TaskStatus status,

        LocalDate dueDate,

        List<@Size(max = 30) String> tagNames
) {
}
