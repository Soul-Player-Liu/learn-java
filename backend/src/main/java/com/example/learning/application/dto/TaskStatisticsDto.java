package com.example.learning.application.dto;

public record TaskStatisticsDto(
        long total,
        long todo,
        long doing,
        long done,
        long overdue,
        long dueSoon
) {
}
