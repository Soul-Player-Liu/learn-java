package com.example.learning.interfaces.rest;

import com.example.learning.domain.model.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeTaskStatusRequest(
        @NotNull TaskStatus status
) {
}
