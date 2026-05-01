package com.example.learning.infrastructure.persistence;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class LearningProjectRecord {

    private Long id;
    private String name;
    private String description;
    private int taskCount;
    private int doneTaskCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
