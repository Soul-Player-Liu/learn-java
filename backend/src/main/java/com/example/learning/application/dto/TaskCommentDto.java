package com.example.learning.application.dto;

import com.example.learning.infrastructure.persistence.TaskCommentRecord;

import java.time.LocalDateTime;

public record TaskCommentDto(
        Long id,
        Long taskId,
        String content,
        String author,
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
