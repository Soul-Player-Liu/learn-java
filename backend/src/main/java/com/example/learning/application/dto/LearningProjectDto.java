package com.example.learning.application.dto;

import com.example.learning.infrastructure.persistence.LearningProjectRecord;

import java.time.LocalDateTime;

public record LearningProjectDto(
        Long id,
        String name,
        String description,
        int taskCount,
        int doneTaskCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static LearningProjectDto from(LearningProjectRecord record) {
        return new LearningProjectDto(
                record.getId(),
                record.getName(),
                record.getDescription(),
                record.getTaskCount(),
                record.getDoneTaskCount(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
