package com.example.learning.application.port;

public interface TaskNotificationClient {

    void taskCreated(Long taskId, String title);
}
