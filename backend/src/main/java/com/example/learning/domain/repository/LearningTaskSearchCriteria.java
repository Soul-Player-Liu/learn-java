package com.example.learning.domain.repository;

import com.example.learning.domain.model.TaskStatus;

public record LearningTaskSearchCriteria(
        TaskStatus status,
        Long projectId,
        String keyword,
        boolean overdueOnly,
        String tag
) {
}
