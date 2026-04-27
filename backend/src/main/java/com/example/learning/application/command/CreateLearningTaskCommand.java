package com.example.learning.application.command;

import java.time.LocalDate;

public record CreateLearningTaskCommand(String title, String description, LocalDate dueDate) {
}
