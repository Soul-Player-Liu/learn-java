package com.example.learning.interfaces.rest;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        String code,
        String message,
        String path,
        Instant timestamp,
        String traceId,
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

    public record ErrorDetail(String field, String message) {
    }
}
