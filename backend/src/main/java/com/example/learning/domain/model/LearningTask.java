package com.example.learning.domain.model;

import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class LearningTask {

    private final Long id;
    private Long projectId;
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDate dueDate;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private LearningTask(Long id, Long projectId, String title, String description, TaskStatus status, LocalDate dueDate,
                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.projectId = projectId;
        this.title = requireTitle(title);
        this.description = description;
        this.status = status == null ? TaskStatus.TODO : status;
        this.dueDate = dueDate;
        this.createdAt = createdAt == null ? LocalDateTime.now() : createdAt;
        this.updatedAt = updatedAt == null ? this.createdAt : updatedAt;
    }

    public static LearningTask create(Long projectId, String title, String description, LocalDate dueDate) {
        LocalDateTime now = LocalDateTime.now();
        return new LearningTask(null, projectId, title, description, TaskStatus.TODO, dueDate, now, now);
    }

    public static LearningTask create(String title, String description, LocalDate dueDate) {
        return create(null, title, description, dueDate);
    }

    public static LearningTask restore(Long id, Long projectId, String title, String description, TaskStatus status,
                                       LocalDate dueDate, LocalDateTime createdAt, LocalDateTime updatedAt) {
        return new LearningTask(id, projectId, title, description, status, dueDate, createdAt, updatedAt);
    }

    public static LearningTask restore(Long id, String title, String description, TaskStatus status, LocalDate dueDate,
                                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        return restore(id, null, title, description, status, dueDate, createdAt, updatedAt);
    }

    public void moveToProject(Long projectId) {
        this.projectId = projectId;
        touch();
    }

    public void rename(String title) {
        this.title = requireTitle(title);
        touch();
    }

    public void changeDescription(String description) {
        this.description = description;
        touch();
    }

    public void changeDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        touch();
    }

    public void changeStatus(TaskStatus nextStatus) {
        if (nextStatus == null) {
            throw new IllegalArgumentException("Task status cannot be null");
        }
        this.status = nextStatus;
        touch();
    }

    private String requireTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Task title cannot be blank");
        }
        if (title.length() > 100) {
            throw new IllegalArgumentException("Task title cannot exceed 100 characters");
        }
        return title.trim();
    }

    private void touch() {
        this.updatedAt = LocalDateTime.now();
    }
}
