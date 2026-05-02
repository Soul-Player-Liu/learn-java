package com.example.learning.application.dto;

import com.example.learning.infrastructure.persistence.TaskCommentRecord;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Task comment")
public record TaskCommentDto(
        @Schema(description = "Comment id", example = "1")
        Long id,
        @Schema(description = "Task id", example = "10")
        Long taskId,
        @Schema(description = "Comment content", example = "接口已经完成")
        String content,
        @Schema(description = "Comment author", example = "pm")
        String author,
        @Schema(description = "Creation time")
        LocalDateTime createdAt
) {

    public static TaskCommentDto from(TaskCommentRecord record) {
        return new TaskCommentDto(
                record.getId(),
                record.getTaskId(),
                record.getContent(),
                record.getAuthor(),
                record.getCreatedAt()
        );
    }
}
