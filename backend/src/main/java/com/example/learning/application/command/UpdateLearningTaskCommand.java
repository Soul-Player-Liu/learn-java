package com.example.learning.application.command;

import com.example.learning.domain.model.TaskStatus;

import java.time.LocalDate;
import java.util.List;

public record UpdateLearningTaskCommand(Long projectId, String title, String description, TaskStatus status,
                                        LocalDate dueDate, List<String> tagNames) {

    public UpdateLearningTaskCommand(String title, String description, TaskStatus status, LocalDate dueDate) {
        this(null, title, description, status, dueDate, List.of());
    }
}
