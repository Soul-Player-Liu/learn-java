package com.example.learning.interfaces.rest;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Create task comment request")
public record CreateTaskCommentRequest(
        @Schema(description = "Comment content", example = "接口已经完成", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        @Size(max = 1000)
        String content,

        @Schema(description = "Comment author", example = "pm")
        @Size(max = 50)
        String author
) {
}
