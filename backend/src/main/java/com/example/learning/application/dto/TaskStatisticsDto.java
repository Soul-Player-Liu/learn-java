package com.example.learning.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Task statistics")
public record TaskStatisticsDto(
        @Schema(description = "Total task count", example = "10", requiredMode = Schema.RequiredMode.REQUIRED)
        long total,
        @Schema(description = "Todo task count", example = "4", requiredMode = Schema.RequiredMode.REQUIRED)
        long todo,
        @Schema(description = "Doing task count", example = "3", requiredMode = Schema.RequiredMode.REQUIRED)
        long doing,
        @Schema(description = "Done task count", example = "3", requiredMode = Schema.RequiredMode.REQUIRED)
        long done,
        @Schema(description = "Overdue unfinished task count", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        long overdue,
        @Schema(description = "Due soon unfinished task count", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
        long dueSoon
) {
}
