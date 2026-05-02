package com.example.learning.application.port;

import com.example.learning.application.dto.LearningProjectDto;
import com.example.learning.application.dto.TaskActivityDto;
import com.example.learning.application.dto.TaskCommentDto;
import com.example.learning.application.dto.TaskTagDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LearningWorkspaceRepository {

    LearningProjectDto createProject(String name, String description, LocalDateTime createdAt, LocalDateTime updatedAt);

    Optional<LearningProjectDto> findProjectById(Long id);

    List<LearningProjectDto> findAllProjects();

    String findProjectNameById(Long id);

    TaskCommentDto createComment(Long taskId, String content, String author, LocalDateTime createdAt);

    List<TaskCommentDto> findCommentsByTaskId(Long taskId);

    TaskActivityDto createActivity(Long taskId, String type, String message, LocalDateTime createdAt);

    List<TaskActivityDto> findActivitiesByTaskId(Long taskId);

    Optional<TaskTagDto> findTagByName(String name);

    TaskTagDto createTag(String name, String color, LocalDateTime createdAt);

    List<TaskTagDto> findAllTags();

    List<String> findTagNamesByTaskId(Long taskId);

    void replaceTaskTags(Long taskId, List<Long> tagIds);
}
