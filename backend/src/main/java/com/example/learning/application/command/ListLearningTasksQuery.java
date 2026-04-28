package com.example.learning.application.command;

import com.example.learning.domain.model.TaskStatus;

public record ListLearningTasksQuery(
        TaskStatus status,
        String keyword,
        Boolean overdueOnly
) {

    public String normalizedKeyword() {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }
        return keyword.trim();
    }

    public boolean isOverdueOnly() {
        return Boolean.TRUE.equals(overdueOnly);
    }
}
