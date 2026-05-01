package com.example.learning.application.dto;

import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.model.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record LearningTaskDto(
        Long id,
        Long projectId,
        String projectName,
        String title,
        String description,
        TaskStatus status,
        LocalDate dueDate,
        List<String> tagNames,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static LearningTaskDto from(LearningTask task) {
        return from(task, null, List.of());
    }

    public static LearningTaskDto from(LearningTask task, String projectName, List<String> tagNames) {
        return new LearningTaskDto(
                task.getId(),
                task.getProjectId(),
                projectName,
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueDate(),
                tagNames == null ? List.of() : tagNames,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
