package com.example.learning.application.command;

import java.time.LocalDate;
import java.util.List;

public record CreateLearningTaskCommand(Long projectId, String title, String description, LocalDate dueDate,
                                        List<String> tagNames) {

    public CreateLearningTaskCommand(String title, String description, LocalDate dueDate) {
        this(null, title, description, dueDate, List.of());
    }
}
