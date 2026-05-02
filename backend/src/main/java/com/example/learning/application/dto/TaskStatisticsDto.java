package com.example.learning.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Task statistics")
public record TaskStatisticsDto(
        @Schema(description = "Total task count", example = "10")
        long total,
        @Schema(description = "Todo task count", example = "4")
        long todo,
        @Schema(description = "Doing task count", example = "3")
        long doing,
        @Schema(description = "Done task count", example = "3")
        long done,
        @Schema(description = "Overdue unfinished task count", example = "1")
        long overdue,
        @Schema(description = "Due soon unfinished task count", example = "2")
        long dueSoon
) {
}
