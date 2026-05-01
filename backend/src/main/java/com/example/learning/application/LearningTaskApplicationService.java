package com.example.learning.application;

import com.example.learning.application.command.ChangeTaskStatusCommand;
import com.example.learning.application.command.CreateLearningProjectCommand;
import com.example.learning.application.command.CreateLearningTaskCommand;
import com.example.learning.application.command.CreateTaskCommentCommand;
import com.example.learning.application.command.ListLearningTasksQuery;
import com.example.learning.application.command.UpdateLearningTaskCommand;
import com.example.learning.application.dto.LearningTaskDto;
import com.example.learning.application.dto.LearningProjectDto;
import com.example.learning.application.dto.TaskActivityDto;
import com.example.learning.application.dto.TaskCommentDto;
import com.example.learning.application.dto.TaskStatisticsDto;
import com.example.learning.application.dto.TaskTagDto;
import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.model.TaskStatus;
import com.example.learning.domain.repository.LearningTaskRepository;
import com.example.learning.infrastructure.persistence.LearningProjectRecord;
import com.example.learning.infrastructure.persistence.LearningTagRecord;
import com.example.learning.infrastructure.persistence.LearningWorkspaceMapper;
import com.example.learning.infrastructure.persistence.TaskActivityRecord;
import com.example.learning.infrastructure.persistence.TaskCommentRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningTaskApplicationService {

    private final LearningTaskRepository taskRepository;
    private final LearningWorkspaceMapper workspaceMapper;

    @Transactional(readOnly = true)
    public List<LearningTaskDto> listTasks(ListLearningTasksQuery query) {
        log.debug("Listing learning tasks status={} keyword={} overdueOnly={}",
                query.status(), query.normalizedKeyword(), query.isOverdueOnly());
        return taskRepository.findAll(query).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public LearningTaskDto getTask(Long id) {
        log.debug("Getting learning task id={}", id);
        return taskRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public List<LearningProjectDto> listProjects() {
        return workspaceMapper.findAllProjects().stream()
                .map(LearningProjectDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public LearningProjectDto getProject(Long id) {
        return LearningProjectDto.from(requireProject(id));
    }

    @Transactional
    public LearningProjectDto createProject(CreateLearningProjectCommand command) {
        LearningProjectRecord record = new LearningProjectRecord();
        LocalDateTime now = LocalDateTime.now();
        record.setName(requireText(command.name(), "Project name", 100));
        record.setDescription(trimToNull(command.description()));
        record.setCreatedAt(now);
        record.setUpdatedAt(now);
        workspaceMapper.insertProject(record);
        return LearningProjectDto.from(requireProject(record.getId()));
    }

    @Transactional(readOnly = true)
    public List<TaskCommentDto> listComments(Long taskId) {
        requireTask(taskId);
        return workspaceMapper.findCommentsByTaskId(taskId).stream()
                .map(TaskCommentDto::from)
                .toList();
    }

    @Transactional
    public TaskCommentDto addComment(Long taskId, CreateTaskCommentCommand command) {
        requireTask(taskId);
        TaskCommentRecord record = new TaskCommentRecord();
        record.setTaskId(taskId);
        record.setContent(requireText(command.content(), "Comment content", 1000));
        record.setAuthor(requireText(command.author() == null ? "产品经理" : command.author(), "Comment author", 50));
        record.setCreatedAt(LocalDateTime.now());
        workspaceMapper.insertComment(record);
        addActivity(taskId, "COMMENT_ADDED", record.getAuthor() + " 评论了任务");
        return TaskCommentDto.from(record);
    }

    @Transactional(readOnly = true)
    public List<TaskActivityDto> listActivities(Long taskId) {
        requireTask(taskId);
        return workspaceMapper.findActivitiesByTaskId(taskId).stream()
                .map(TaskActivityDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskTagDto> listTags() {
        return workspaceMapper.findAllTags().stream()
                .map(TaskTagDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskStatisticsDto getStatistics() {
        LocalDate today = LocalDate.now();
        LocalDate dueSoonLimit = today.plusDays(7);
        List<LearningTask> tasks = taskRepository.findAll(new ListLearningTasksQuery(null, null, false));
        long todo = tasks.stream().filter(task -> task.getStatus() == TaskStatus.TODO).count();
        long doing = tasks.stream().filter(task -> task.getStatus() == TaskStatus.DOING).count();
        long done = tasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count();
        long overdue = tasks.stream().filter(task -> isOverdue(task, today)).count();
        long dueSoon = tasks.stream().filter(task -> isDueSoon(task, today, dueSoonLimit)).count();
        return new TaskStatisticsDto(tasks.size(), todo, doing, done, overdue, dueSoon);
    }

    @Transactional
    public LearningTaskDto createTask(CreateLearningTaskCommand command) {
        log.info("Creating learning task title={}", command.title());
        requireProjectIfPresent(command.projectId());
        LearningTask task = LearningTask.create(command.projectId(), command.title(), command.description(), command.dueDate());
        LearningTask savedTask = taskRepository.save(task);
        replaceTags(savedTask.getId(), command.tagNames());
        addActivity(savedTask.getId(), "TASK_CREATED", "创建了任务");
        log.info("Created learning task id={}", savedTask.getId());
        return toDto(savedTask);
    }

    @Transactional
    public LearningTaskDto updateTask(Long id, UpdateLearningTaskCommand command) {
        log.info("Updating learning task id={} status={}", id, command.status());
        LearningTask task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        requireProjectIfPresent(command.projectId());
        task.moveToProject(command.projectId());
        task.rename(command.title());
        task.changeDescription(command.description());
        task.changeDueDate(command.dueDate());
        task.changeStatus(command.status());
        LearningTask savedTask = taskRepository.save(task);
        replaceTags(savedTask.getId(), command.tagNames());
        addActivity(id, "TASK_UPDATED", "更新了任务信息");
        log.info("Updated learning task id={}", savedTask.getId());
        return toDto(savedTask);
    }

    @Transactional
    public LearningTaskDto changeTaskStatus(Long id, ChangeTaskStatusCommand command) {
        log.info("Changing learning task status id={} status={}", id, command.status());
        LearningTask task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        task.changeStatus(command.status());
        LearningTask savedTask = taskRepository.save(task);
        addActivity(id, "STATUS_CHANGED", "状态更新为 " + command.status());
        log.info("Changed learning task status id={}", savedTask.getId());
        return toDto(savedTask);
    }

    @Transactional
    public void deleteTask(Long id) {
        log.info("Deleting learning task id={}", id);
        if (taskRepository.findById(id).isEmpty()) {
            throw new TaskNotFoundException(id);
        }
        taskRepository.deleteById(id);
        log.info("Deleted learning task id={}", id);
    }

    private boolean isOverdue(LearningTask task, LocalDate today) {
        return task.getStatus() != TaskStatus.DONE
                && task.getDueDate() != null
                && task.getDueDate().isBefore(today);
    }

    private boolean isDueSoon(LearningTask task, LocalDate today, LocalDate dueSoonLimit) {
        return task.getStatus() != TaskStatus.DONE
                && task.getDueDate() != null
                && !task.getDueDate().isBefore(today)
                && !task.getDueDate().isAfter(dueSoonLimit);
    }

    private LearningTask requireTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    private LearningProjectRecord requireProject(Long id) {
        LearningProjectRecord project = workspaceMapper.findProjectById(id);
        if (project == null) {
            throw new ResourceNotFoundException("Project not found: " + id);
        }
        return project;
    }

    private void requireProjectIfPresent(Long projectId) {
        if (projectId != null) {
            requireProject(projectId);
        }
    }

    private LearningTaskDto toDto(LearningTask task) {
        String projectName = task.getProjectId() == null ? null : workspaceMapper.findProjectNameById(task.getProjectId());
        return LearningTaskDto.from(task, projectName, workspaceMapper.findTagNamesByTaskId(task.getId()));
    }

    private void replaceTags(Long taskId, List<String> tagNames) {
        workspaceMapper.deleteTaskTags(taskId);
        normalizeTagNames(tagNames).forEach(tagName -> {
            LearningTagRecord tag = workspaceMapper.findTagByName(tagName);
            if (tag == null) {
                tag = new LearningTagRecord();
                tag.setName(tagName);
                tag.setColor(defaultTagColor(tagName));
                tag.setCreatedAt(LocalDateTime.now());
                workspaceMapper.insertTag(tag);
            }
            workspaceMapper.insertTaskTag(taskId, tag.getId());
        });
    }

    private List<String> normalizeTagNames(List<String> tagNames) {
        if (tagNames == null) {
            return List.of();
        }
        LinkedHashSet<String> normalizedNames = tagNames.stream()
                .map(this::trimToNull)
                .filter(value -> value != null && value.length() <= 30)
                .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);
        return normalizedNames.stream().toList();
    }

    private void addActivity(Long taskId, String type, String message) {
        TaskActivityRecord activity = new TaskActivityRecord();
        activity.setTaskId(taskId);
        activity.setType(type);
        activity.setMessage(message);
        activity.setCreatedAt(LocalDateTime.now());
        workspaceMapper.insertActivity(activity);
    }

    private String requireText(String value, String label, int maxLength) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            throw new IllegalArgumentException(label + " cannot be blank");
        }
        if (trimmed.length() > maxLength) {
            throw new IllegalArgumentException(label + " cannot exceed " + maxLength + " characters");
        }
        return trimmed;
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private String defaultTagColor(String tagName) {
        int bucket = Math.abs(tagName.toLowerCase(Locale.ROOT).hashCode() % 5);
        return switch (bucket) {
            case 0 -> "blue";
            case 1 -> "green";
            case 2 -> "orange";
            case 3 -> "purple";
            default -> "gray";
        };
    }
}
