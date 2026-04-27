package com.example.learning.application.command;

import com.example.learning.domain.model.TaskStatus;

import java.time.LocalDate;

public record UpdateLearningTaskCommand(String title, String description, TaskStatus status, LocalDate dueDate) {
}
