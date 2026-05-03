package com.example.learning.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Task comment")
public record TaskCommentDto(
        @Schema(description = "Comment id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long id,
        @Schema(description = "Task id", example = "10", requiredMode = Schema.RequiredMode.REQUIRED)
        Long taskId,
        @Schema(description = "Comment content", example = "接口已经完成", requiredMode = Schema.RequiredMode.REQUIRED)
        String content,
        @Schema(description = "Comment author", example = "pm", requiredMode = Schema.RequiredMode.REQUIRED)
        String author,
        @Schema(description = "Creation time", requiredMode = Schema.RequiredMode.REQUIRED)
        LocalDateTime createdAt
) {
}
