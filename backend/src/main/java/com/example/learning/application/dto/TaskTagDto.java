package com.example.learning.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Task tag")
public record TaskTagDto(
        @Schema(description = "Tag id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long id,

        @Schema(description = "Tag name", example = "sql", requiredMode = Schema.RequiredMode.REQUIRED)
        String name,

        @Schema(description = "Tag color", example = "blue", requiredMode = Schema.RequiredMode.REQUIRED)
        String color
) {
}
