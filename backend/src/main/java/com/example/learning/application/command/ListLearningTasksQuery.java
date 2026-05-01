package com.example.learning.application.command;

import com.example.learning.domain.model.TaskStatus;

public record ListLearningTasksQuery(
        TaskStatus status,
        Long projectId,
        String keyword,
        Boolean overdueOnly,
        String tag
) {

    public ListLearningTasksQuery(TaskStatus status, String keyword, Boolean overdueOnly) {
        this(status, null, keyword, overdueOnly, null);
    }

    public String normalizedKeyword() {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }
        return keyword.trim();
    }

    public boolean isOverdueOnly() {
        return Boolean.TRUE.equals(overdueOnly);
    }

    public String normalizedTag() {
        if (tag == null || tag.trim().isEmpty()) {
            return null;
        }
        return tag.trim();
    }
}
