package com.example.learning.infrastructure.persistence;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class LearningTagRecord {

    private Long id;
    private String name;
    private String color;
    private LocalDateTime createdAt;
}
