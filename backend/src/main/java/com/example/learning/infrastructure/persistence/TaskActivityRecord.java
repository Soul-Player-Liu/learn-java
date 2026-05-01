package com.example.learning.infrastructure.persistence;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TaskActivityRecord {

    private Long id;
    private Long taskId;
    private String type;
    private String message;
    private LocalDateTime createdAt;
}
