package com.example.learning.application;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(Long id) {
        super("Learning task not found: " + id);
    }
}
