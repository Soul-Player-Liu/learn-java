package com.example.learning.application.dto;

import com.example.learning.infrastructure.persistence.LearningTagRecord;

public record TaskTagDto(Long id, String name, String color) {

    public static TaskTagDto from(LearningTagRecord record) {
        return new TaskTagDto(record.getId(), record.getName(), record.getColor());
    }
}
