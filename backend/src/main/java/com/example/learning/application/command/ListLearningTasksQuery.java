package com.example.learning.application.command;

import com.example.learning.domain.model.TaskStatus;

public record ListLearningTasksQuery(
        TaskStatus status,
        Long projectId,
        String keyword,
        Boolean overdueOnly,
        String tag,
        int page,
        int size
) {

    public static final int DEFAULT_PAGE = 1;
    public static final int DEFAULT_SIZE = 20;
    public static final int MAX_SIZE = 100;

    public ListLearningTasksQuery(TaskStatus status, Long projectId, String keyword, Boolean overdueOnly, String tag) {
        this(status, projectId, keyword, overdueOnly, tag, DEFAULT_PAGE, DEFAULT_SIZE);
    }

    public ListLearningTasksQuery(TaskStatus status, String keyword, Boolean overdueOnly) {
        this(status, null, keyword, overdueOnly, null, DEFAULT_PAGE, DEFAULT_SIZE);
    }

    public ListLearningTasksQuery {
        page = Math.max(page, DEFAULT_PAGE);
        size = Math.max(1, Math.min(size, MAX_SIZE));
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

    public int offset() {
        return (page - 1) * size;
    }

    public int limit() {
        return size;
    }
}
