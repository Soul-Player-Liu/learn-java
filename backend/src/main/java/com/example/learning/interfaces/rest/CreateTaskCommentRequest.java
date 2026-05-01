package com.example.learning.interfaces.rest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTaskCommentRequest(
        @NotBlank
        @Size(max = 1000)
        String content,

        @Size(max = 50)
        String author
) {
}
