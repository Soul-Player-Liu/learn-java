package com.example.learning.infrastructure.persistence;

import com.example.learning.application.dto.LearningProjectDto;
import com.example.learning.application.dto.TaskActivityDto;
import com.example.learning.application.dto.TaskCommentDto;
import com.example.learning.application.dto.TaskTagDto;
import com.example.learning.application.port.LearningWorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MyBatisLearningWorkspaceRepository implements LearningWorkspaceRepository {

    private final LearningWorkspaceMapper mapper;

    @Override
    public LearningProjectDto createProject(String name, String description, LocalDateTime createdAt,
                                            LocalDateTime updatedAt) {
        LearningProjectRecord record = new LearningProjectRecord();
        record.setName(name);
        record.setDescription(description);
        record.setCreatedAt(createdAt);
        record.setUpdatedAt(updatedAt);
        mapper.insertProject(record);
        return toDto(record);
    }

    @Override
    public Optional<LearningProjectDto> findProjectById(Long id) {
        return Optional.ofNullable(mapper.findProjectById(id)).map(this::toDto);
    }

    @Override
    public List<LearningProjectDto> findAllProjects() {
        return mapper.findAllProjects().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public String findProjectNameById(Long id) {
        return mapper.findProjectNameById(id);
    }

    @Override
    public TaskCommentDto createComment(Long taskId, String content, String author, LocalDateTime createdAt) {
        TaskCommentRecord record = new TaskCommentRecord();
        record.setTaskId(taskId);
        record.setContent(content);
        record.setAuthor(author);
        record.setCreatedAt(createdAt);
        mapper.insertComment(record);
        return toDto(record);
    }

    @Override
    public List<TaskCommentDto> findCommentsByTaskId(Long taskId) {
        return mapper.findCommentsByTaskId(taskId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public TaskActivityDto createActivity(Long taskId, String type, String message, LocalDateTime createdAt) {
        TaskActivityRecord record = new TaskActivityRecord();
        record.setTaskId(taskId);
        record.setType(type);
        record.setMessage(message);
        record.setCreatedAt(createdAt);
        mapper.insertActivity(record);
        return toDto(record);
    }

    @Override
    public List<TaskActivityDto> findActivitiesByTaskId(Long taskId) {
        return mapper.findActivitiesByTaskId(taskId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public Optional<TaskTagDto> findTagByName(String name) {
        return Optional.ofNullable(mapper.findTagByName(name)).map(this::toDto);
    }

    @Override
    public TaskTagDto createTag(String name, String color, LocalDateTime createdAt) {
        LearningTagRecord record = new LearningTagRecord();
        record.setName(name);
        record.setColor(color);
        record.setCreatedAt(createdAt);
        mapper.insertTag(record);
        return toDto(record);
    }

    @Override
    public List<TaskTagDto> findAllTags() {
        return mapper.findAllTags().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<String> findTagNamesByTaskId(Long taskId) {
        return mapper.findTagNamesByTaskId(taskId);
    }

    @Override
    public void replaceTaskTags(Long taskId, List<Long> tagIds) {
        mapper.deleteTaskTags(taskId);
        tagIds.forEach(tagId -> mapper.insertTaskTag(taskId, tagId));
    }

    private LearningProjectDto toDto(LearningProjectRecord record) {
        return new LearningProjectDto(
                record.getId(),
                record.getName(),
                record.getDescription(),
                record.getTaskCount(),
                record.getDoneTaskCount(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }

    private TaskCommentDto toDto(TaskCommentRecord record) {
        return new TaskCommentDto(
                record.getId(),
                record.getTaskId(),
                record.getContent(),
                record.getAuthor(),
                record.getCreatedAt()
        );
    }

    private TaskActivityDto toDto(TaskActivityRecord record) {
        return new TaskActivityDto(
                record.getId(),
                record.getTaskId(),
                record.getType(),
                record.getMessage(),
                record.getCreatedAt()
        );
    }

    private TaskTagDto toDto(LearningTagRecord record) {
        return new TaskTagDto(record.getId(), record.getName(), record.getColor());
    }
}
