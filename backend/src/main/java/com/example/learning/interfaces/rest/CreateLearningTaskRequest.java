package com.example.learning.interfaces.rest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record CreateLearningTaskRequest(
        Long projectId,

        @NotBlank
        @Size(max = 100)
        String title,

        @Size(max = 500)
        String description,

        LocalDate dueDate,

        List<@Size(max = 30) String> tagNames
) {
}
