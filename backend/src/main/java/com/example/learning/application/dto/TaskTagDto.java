package com.example.learning.application.dto;

import com.example.learning.infrastructure.persistence.LearningTagRecord;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Task tag")
public record TaskTagDto(
        @Schema(description = "Tag id", example = "1")
        Long id,

        @Schema(description = "Tag name", example = "sql")
        String name,

        @Schema(description = "Tag color", example = "blue")
        String color
) {

    public static TaskTagDto from(LearningTagRecord record) {
        return new TaskTagDto(record.getId(), record.getName(), record.getColor());
    }
}
