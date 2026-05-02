package com.example.learning.infrastructure.persistence;

import com.example.learning.application.dto.TaskListItemDto;
import com.example.learning.domain.model.TaskStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Data
@NoArgsConstructor
public class LearningTaskListItemRecord {

    private Long id;
    private Long projectId;
    private String projectName;
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDate dueDate;
    private String tagNames;
    private long commentCount;
    private LocalDateTime latestActivityAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TaskListItemDto toDto() {
        return new TaskListItemDto(
                id,
                projectId,
                projectName,
                title,
                description,
                status,
                dueDate,
                splitTagNames(),
                commentCount,
                latestActivityAt,
                createdAt,
                updatedAt
        );
    }

    private List<String> splitTagNames() {
        if (tagNames == null || tagNames.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tagNames.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }
}
