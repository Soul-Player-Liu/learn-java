package com.example.learning.infrastructure.persistence;

import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.model.TaskStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class MyBatisLearningTaskRecord {

    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MyBatisLearningTaskRecord fromDomain(LearningTask task) {
        MyBatisLearningTaskRecord record = new MyBatisLearningTaskRecord();
        record.id = task.getId();
        record.projectId = task.getProjectId();
        record.title = task.getTitle();
        record.description = task.getDescription();
        record.status = task.getStatus();
        record.dueDate = task.getDueDate();
        record.createdAt = task.getCreatedAt();
        record.updatedAt = task.getUpdatedAt();
        return record;
    }

    public LearningTask toDomain() {
        return LearningTask.restore(id, projectId, title, description, status, dueDate, createdAt, updatedAt);
    }
}
