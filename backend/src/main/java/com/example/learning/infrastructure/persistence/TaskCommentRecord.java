package com.example.learning.infrastructure.persistence;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TaskCommentRecord {

    private Long id;
    private Long taskId;
    private String content;
    private String author;
    private LocalDateTime createdAt;
}
