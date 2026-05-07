package com.example.learning.application.port;

public interface TaskArchiveClient {

    ArchivedTaskBrief archiveTaskBrief(Long taskId, String title, String description);
}
