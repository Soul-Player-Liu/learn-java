package com.example.learning.interfaces.rest;

import com.example.learning.domain.model.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Change task status request")
public record ChangeTaskStatusRequest(
        @Schema(description = "Target task status", example = "DOING")
        @NotNull TaskStatus status
) {
}
