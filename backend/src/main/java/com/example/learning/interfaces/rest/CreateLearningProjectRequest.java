package com.example.learning.interfaces.rest;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Create learning project request")
public record CreateLearningProjectRequest(
        @Schema(description = "Project name", example = "Backend Track")
        @NotBlank
        @Size(max = 100)
        String name,

        @Schema(description = "Project description", example = "Spring Boot and MyBatis milestones")
        @Size(max = 500)
        String description
) {
}
