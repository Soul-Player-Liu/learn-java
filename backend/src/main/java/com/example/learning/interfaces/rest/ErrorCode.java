package com.example.learning.interfaces.rest;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "API response code")
public enum ErrorCode {
    OK,
    VALIDATION_FAILED,
    RESOURCE_NOT_FOUND,
    MALFORMED_REQUEST,
    BAD_REQUEST,
    INTERNAL_ERROR
}
