package com.example.learning.interfaces.rest;

import com.example.learning.application.ResourceNotFoundException;
import com.example.learning.application.TaskNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler({TaskNotFoundException.class, ResourceNotFoundException.class})
    public ResponseEntity<ApiResponse<Void>> handleNotFound(RuntimeException ex, HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        return error(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationFailed(MethodArgumentNotValidException ex,
                                                                    HttpServletRequest request) {
        List<ApiResponse.ErrorDetail> details = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ApiResponse.ErrorDetail(error.getField(), error.getDefaultMessage()))
                .toList();
        log.warn("Request body validation failed details={}", details);
        return error(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, "Request validation failed", request, details);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleQueryValidationFailed(ConstraintViolationException ex,
                                                                        HttpServletRequest request) {
        List<ApiResponse.ErrorDetail> details = ex.getConstraintViolations().stream()
                .map(violation -> new ApiResponse.ErrorDetail(violation.getPropertyPath().toString(),
                        violation.getMessage()))
                .toList();
        log.warn("Request parameter validation failed details={}", details);
        return error(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, "Request validation failed", request, details);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("Request validation failed: {}", ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> handleMalformedRequest(Exception ex, HttpServletRequest request) {
        log.warn("Request could not be parsed: {}", ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, ErrorCode.MALFORMED_REQUEST, "Request could not be parsed", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unexpected request failure", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Internal server error", request);
    }

    private ResponseEntity<ApiResponse<Void>> error(HttpStatus status, ErrorCode code, String message,
                                                    HttpServletRequest request) {
        return error(status, code, message, request, List.of());
    }

    private ResponseEntity<ApiResponse<Void>> error(HttpStatus status, ErrorCode code, String message,
                                                    HttpServletRequest request,
                                                    List<ApiResponse.ErrorDetail> details) {
        return ResponseEntity.status(status)
                .body(ApiResponse.error(code, message, request.getRequestURI(), RestResponses.traceId(), details));
    }
}
