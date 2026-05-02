package com.example.learning.interfaces.rest;

import com.example.learning.infrastructure.web.HttpRequestLoggingFilter;
import org.slf4j.MDC;

final class RestResponses {

    private RestResponses() {
    }

    static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.ok(data, traceId());
    }

    static String traceId() {
        return MDC.get(HttpRequestLoggingFilter.TRACE_ID);
    }
}
