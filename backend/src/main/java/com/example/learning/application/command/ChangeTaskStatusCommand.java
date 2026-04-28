package com.example.learning.application.command;

import com.example.learning.domain.model.TaskStatus;

public record ChangeTaskStatusCommand(TaskStatus status) {
}
