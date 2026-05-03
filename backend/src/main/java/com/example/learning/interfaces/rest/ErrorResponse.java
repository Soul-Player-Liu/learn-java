package com.example.learning.interfaces.rest;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        String code,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        String message,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        String path,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        Instant timestamp,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        String traceId,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        List<ErrorDetail> details
) {

    public ErrorResponse {
        details = details == null ? List.of() : List.copyOf(details);
    }

    public static ErrorResponse of(String code, String message, String path, String traceId) {
        return new ErrorResponse(code, message, path, Instant.now(), traceId, List.of());
    }

    public static ErrorResponse of(String code, String message, String path, String traceId, List<ErrorDetail> details) {
        return new ErrorResponse(code, message, path, Instant.now(), traceId, details);
    }

    public record ErrorDetail(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String field,
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String message) {
    }
}
