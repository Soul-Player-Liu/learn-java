package com.example.learning.infrastructure.web;

import com.example.learning.common.RequestTraceContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
public class HttpRequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String traceId = traceId(request);
        long startedAt = System.nanoTime();
        MDC.put(RequestTraceContext.TRACE_ID, traceId);
        response.setHeader(RequestTraceContext.TRACE_HEADER, traceId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
            log.info("HTTP request completed method={} path={} status={} durationMs={} traceId={}",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs, traceId);
            MDC.remove(RequestTraceContext.TRACE_ID);
        }
    }

    private String traceId(HttpServletRequest request) {
        String requestId = request.getHeader(RequestTraceContext.TRACE_HEADER);
        if (requestId == null || requestId.isBlank()) {
            return UUID.randomUUID().toString();
        }
        return requestId;
    }
}
