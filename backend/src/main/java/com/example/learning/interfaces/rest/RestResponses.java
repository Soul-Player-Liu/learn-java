package com.example.learning.interfaces.rest;

import com.example.learning.common.RequestTraceContext;
import org.slf4j.MDC;

final class RestResponses {

    private RestResponses() {
    }

    static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.ok(data, traceId());
    }

    static String traceId() {
        return MDC.get(RequestTraceContext.TRACE_ID);
    }
}
