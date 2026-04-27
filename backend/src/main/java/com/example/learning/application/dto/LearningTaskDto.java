package com.example.learning.application.dto;

import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.model.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LearningTaskDto(
        Long id,
        String title,
        String description,
        TaskStatus status,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static LearningTaskDto from(LearningTask task) {
        return new LearningTaskDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
