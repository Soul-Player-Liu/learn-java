package com.example.learning.interfaces.rest;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@Schema(description = "Unified API response envelope")
public record ApiResponse<T>(
        @Schema(description = "Business response code", example = "OK")
        ErrorCode code,

        @Schema(description = "Human-readable response message", example = "success")
        String message,

        @Schema(description = "Response payload")
        T data,

        @Schema(description = "Request path", example = "/api/tasks")
        String path,

        @Schema(description = "Response timestamp")
        Instant timestamp,

        @Schema(description = "Trace id matching the X-Request-Id response header")
        String traceId,

        @Schema(description = "Validation or field-level error details")
        List<ErrorDetail> details
) {

    public ApiResponse {
        details = details == null ? List.of() : List.copyOf(details);
    }

    public static <T> ApiResponse<T> ok(T data, String traceId) {
        return new ApiResponse<>(ErrorCode.OK, "success", data, null, Instant.now(), traceId, List.of());
    }

    public static ApiResponse<Void> error(ErrorCode code, String message, String path, String traceId) {
        return error(code, message, path, traceId, List.of());
    }

    public static ApiResponse<Void> error(ErrorCode code, String message, String path, String traceId,
                                          List<ErrorDetail> details) {
        return new ApiResponse<>(code, message, null, path, Instant.now(), traceId, details);
    }

    @Schema(description = "Field-level error detail")
    public record ErrorDetail(
            @Schema(description = "Invalid field name", example = "title")
            String field,

            @Schema(description = "Validation message", example = "must not be blank")
            String message
    ) {
    }
}
