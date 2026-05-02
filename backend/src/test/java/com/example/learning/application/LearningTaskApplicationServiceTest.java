package com.example.learning.application;

import com.example.learning.application.command.ChangeTaskStatusCommand;
import com.example.learning.application.command.CreateLearningProjectCommand;
import com.example.learning.application.command.CreateLearningTaskCommand;
import com.example.learning.application.command.CreateTaskCommentCommand;
import com.example.learning.application.command.ListLearningTasksQuery;
import com.example.learning.application.dto.LearningProjectDto;
import com.example.learning.application.dto.LearningTaskDto;
import com.example.learning.application.dto.TaskListItemDto;
import com.example.learning.application.dto.TaskStatisticsDto;
import com.example.learning.application.dto.TaskActivityDto;
import com.example.learning.application.dto.TaskCommentDto;
import com.example.learning.application.dto.TaskTagDto;
import com.example.learning.application.port.LearningTaskQueryRepository;
import com.example.learning.application.port.LearningWorkspaceRepository;
import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.model.TaskStatus;
import com.example.learning.domain.repository.LearningTaskRepository;
import com.example.learning.domain.repository.LearningTaskSearchCriteria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LearningTaskApplicationServiceTest {

    private FakeLearningTaskRepository repository;
    private FakeLearningWorkspaceRepository workspaceRepository;
    private LearningTaskApplicationService service;

    @BeforeEach
    void setUp() {
        workspaceRepository = new FakeLearningWorkspaceRepository();
        repository = new FakeLearningTaskRepository(workspaceRepository);
        service = new LearningTaskApplicationService(repository, new FakeLearningTaskQueryRepository(repository, workspaceRepository),
                workspaceRepository);
    }

    @Test
    void createTaskPersistsNewTodoTask() {
        LearningTaskDto task = service.createTask(new CreateLearningTaskCommand(
                "Learn service layer",
                "Write a use-case test",
                LocalDate.now().plusDays(1)
        ));

        assertThat(task.id()).isNotNull();
        assertThat(task.title()).isEqualTo("Learn service layer");
        assertThat(task.status()).isEqualTo(TaskStatus.TODO);
        assertThat(repository.findById(task.id())).isPresent();
    }

    @Test
    void changeStatusUpdatesExistingTask() {
        LearningTaskDto task = service.createTask(new CreateLearningTaskCommand("Learn status", null, null));

        LearningTaskDto updatedTask = service.changeTaskStatus(task.id(), new ChangeTaskStatusCommand(TaskStatus.DOING));

        assertThat(updatedTask.status()).isEqualTo(TaskStatus.DOING);
        assertThat(service.listActivities(task.id()))
                .extracting(activity -> activity.type())
                .contains("STATUS_CHANGED");
    }

    @Test
    void createProjectAndTaggedTaskCanBeFilteredTogether() {
        LearningProjectDto project = service.createProject(new CreateLearningProjectCommand(
                "Java learning path",
                "Backend and frontend milestones"
        ));

        LearningTaskDto task = service.createTask(new CreateLearningTaskCommand(
                project.id(),
                "Learn MyBatis",
                "Write mapper tests",
                LocalDate.now().plusDays(3),
                List.of("backend", "sql")
        ));
        service.createTask(new CreateLearningTaskCommand(
                project.id(),
                "Learn Vue",
                "Write component tests",
                LocalDate.now().plusDays(3),
                List.of("frontend")
        ));

        List<TaskListItemDto> filteredTasks = service.listTasks(
                new ListLearningTasksQuery(null, project.id(), null, false, "backend")
        ).items();

        assertThat(task.projectName()).isEqualTo("Java learning path");
        assertThat(task.tagNames()).containsExactly("backend", "sql");
        assertThat(filteredTasks)
                .extracting(TaskListItemDto::title)
                .containsExactly("Learn MyBatis");
    }

    @Test
    void addingCommentCreatesActivity() {
        LearningTaskDto task = service.createTask(new CreateLearningTaskCommand("Learn comments", null, null));

        service.addComment(task.id(), new CreateTaskCommentCommand("Need an activity timeline", "Alex"));

        assertThat(service.listComments(task.id()))
                .extracting(comment -> comment.content())
                .containsExactly("Need an activity timeline");
        assertThat(service.listActivities(task.id()))
                .extracting(activity -> activity.type())
                .contains("COMMENT_ADDED");
    }

    @Test
    void updateMissingTaskRaisesNotFoundError() {
        assertThatThrownBy(() -> service.changeTaskStatus(404L, new ChangeTaskStatusCommand(TaskStatus.DONE)))
                .isInstanceOf(TaskNotFoundException.class);
    }

    @Test
    void statisticsCountsTaskStatusAndDueDateBuckets() {
        LearningTask overdueTask = repository.save(LearningTask.create("Overdue", null, LocalDate.now().minusDays(1)));
        LearningTask doingTask = repository.save(LearningTask.create("Doing", null, LocalDate.now().plusDays(2)));
        doingTask.changeStatus(TaskStatus.DOING);
        repository.save(doingTask);
        LearningTask doneTask = repository.save(LearningTask.create("Done", null, LocalDate.now().minusDays(3)));
        doneTask.changeStatus(TaskStatus.DONE);
        repository.save(doneTask);

        TaskStatisticsDto statistics = service.getStatistics();

        assertThat(statistics.total()).isEqualTo(3);
        assertThat(statistics.todo()).isEqualTo(1);
        assertThat(statistics.doing()).isEqualTo(1);
        assertThat(statistics.done()).isEqualTo(1);
        assertThat(statistics.overdue()).isEqualTo(1);
        assertThat(statistics.dueSoon()).isEqualTo(1);
        assertThat(repository.findById(overdueTask.getId())).isPresent();
    }

    private static final class FakeLearningTaskRepository implements LearningTaskRepository {

        private final Map<Long, LearningTask> tasks = new LinkedHashMap<>();
        private final FakeLearningWorkspaceRepository workspaceRepository;
        private long nextId = 1;

        private FakeLearningTaskRepository(FakeLearningWorkspaceRepository workspaceRepository) {
            this.workspaceRepository = workspaceRepository;
        }

        @Override
        public LearningTask save(LearningTask task) {
            LearningTask savedTask = task.getId() == null
                    ? LearningTask.restore(nextId++, task.getProjectId(), task.getTitle(), task.getDescription(), task.getStatus(),
                    task.getDueDate(), task.getCreatedAt(), task.getUpdatedAt())
                    : task;
            tasks.put(savedTask.getId(), savedTask);
            return savedTask;
        }

        @Override
        public Optional<LearningTask> findById(Long id) {
            return Optional.ofNullable(tasks.get(id));
        }

        @Override
        public List<LearningTask> findAll(LearningTaskSearchCriteria criteria) {
            String keyword = criteria.keyword();
            String tag = criteria.tag();
            return new ArrayList<>(tasks.values()).stream()
                    .filter(task -> criteria.status() == null || task.getStatus() == criteria.status())
                    .filter(task -> criteria.projectId() == null || criteria.projectId().equals(task.getProjectId()))
                    .filter(task -> keyword == null || contains(task.getTitle(), keyword)
                            || contains(task.getDescription(), keyword))
                    .filter(task -> !criteria.overdueOnly() || isOverdue(task))
                    .filter(task -> tag == null || workspaceRepository.hasTag(task.getId(), tag))
                    .toList();
        }

        @Override
        public void deleteById(Long id) {
            tasks.remove(id);
        }

        private boolean contains(String value, String keyword) {
            return value != null && value.contains(keyword);
        }

        private boolean isOverdue(LearningTask task) {
            return task.getStatus() != TaskStatus.DONE
                    && task.getDueDate() != null
                    && task.getDueDate().isBefore(LocalDate.now());
        }
    }

    private static final class FakeLearningTaskQueryRepository implements LearningTaskQueryRepository {

        private final FakeLearningTaskRepository repository;
        private final FakeLearningWorkspaceRepository workspaceRepository;

        private FakeLearningTaskQueryRepository(FakeLearningTaskRepository repository,
                                                FakeLearningWorkspaceRepository workspaceRepository) {
            this.repository = repository;
            this.workspaceRepository = workspaceRepository;
        }

        @Override
        public long count(ListLearningTasksQuery query) {
            return repository.findAll(toCriteria(query)).size();
        }

        @Override
        public List<TaskListItemDto> findPage(ListLearningTasksQuery query) {
            List<LearningTask> tasks = repository.findAll(toCriteria(query));
            int fromIndex = Math.min(query.offset(), tasks.size());
            int toIndex = Math.min(fromIndex + query.limit(), tasks.size());
            return tasks.subList(fromIndex, toIndex).stream()
                    .map(task -> new TaskListItemDto(
                            task.getId(),
                            task.getProjectId(),
                            task.getProjectId() == null ? null : workspaceRepository.findProjectNameById(task.getProjectId()),
                            task.getTitle(),
                            task.getDescription(),
                            task.getStatus(),
                            task.getDueDate(),
                            workspaceRepository.findTagNamesByTaskId(task.getId()),
                            workspaceRepository.findCommentsByTaskId(task.getId()).size(),
                            workspaceRepository.findActivitiesByTaskId(task.getId()).stream()
                                    .map(TaskActivityDto::createdAt)
                                    .max(LocalDateTime::compareTo)
                                    .orElse(null),
                            task.getCreatedAt(),
                            task.getUpdatedAt()
                    ))
                    .toList();
        }

        private LearningTaskSearchCriteria toCriteria(ListLearningTasksQuery query) {
            return new LearningTaskSearchCriteria(
                    query.status(),
                    query.projectId(),
                    query.normalizedKeyword(),
                    query.isOverdueOnly(),
                    query.normalizedTag()
            );
        }
    }

    private static final class FakeLearningWorkspaceRepository implements LearningWorkspaceRepository {

        private final Map<Long, LearningProjectDto> projects = new LinkedHashMap<>();
        private final Map<Long, List<String>> tagsByTaskId = new HashMap<>();
        private final Map<String, TaskTagDto> tagsByName = new LinkedHashMap<>();
        private final Map<Long, List<TaskCommentDto>> commentsByTaskId = new HashMap<>();
        private final Map<Long, List<TaskActivityDto>> activitiesByTaskId = new HashMap<>();
        private long nextProjectId = 1;
        private long nextTagId = 1;
        private long nextCommentId = 1;
        private long nextActivityId = 1;

        @Override
        public LearningProjectDto createProject(String name, String description, LocalDateTime createdAt,
                                                LocalDateTime updatedAt) {
            LearningProjectDto project = new LearningProjectDto(nextProjectId++, name, description, 0, 0,
                    createdAt, updatedAt);
            projects.put(project.id(), project);
            return project;
        }

        @Override
        public Optional<LearningProjectDto> findProjectById(Long id) {
            return Optional.ofNullable(projects.get(id));
        }

        @Override
        public List<LearningProjectDto> findAllProjects() {
            return new ArrayList<>(projects.values());
        }

        @Override
        public String findProjectNameById(Long id) {
            LearningProjectDto project = projects.get(id);
            return project == null ? null : project.name();
        }

        @Override
        public TaskCommentDto createComment(Long taskId, String content, String author, LocalDateTime createdAt) {
            TaskCommentDto comment = new TaskCommentDto(nextCommentId++, taskId, content, author, createdAt);
            commentsByTaskId.computeIfAbsent(taskId, key -> new ArrayList<>()).add(0, comment);
            return comment;
        }

        @Override
        public List<TaskCommentDto> findCommentsByTaskId(Long taskId) {
            return commentsByTaskId.getOrDefault(taskId, List.of());
        }

        @Override
        public TaskActivityDto createActivity(Long taskId, String type, String message, LocalDateTime createdAt) {
            TaskActivityDto activity = new TaskActivityDto(nextActivityId++, taskId, type, message, createdAt);
            activitiesByTaskId.computeIfAbsent(taskId, key -> new ArrayList<>()).add(0, activity);
            return activity;
        }

        @Override
        public List<TaskActivityDto> findActivitiesByTaskId(Long taskId) {
            return activitiesByTaskId.getOrDefault(taskId, List.of());
        }

        @Override
        public Optional<TaskTagDto> findTagByName(String name) {
            return Optional.ofNullable(tagsByName.get(name));
        }

        @Override
        public TaskTagDto createTag(String name, String color, LocalDateTime createdAt) {
            TaskTagDto tag = new TaskTagDto(nextTagId++, name, color);
            tagsByName.put(name, tag);
            return tag;
        }

        @Override
        public List<TaskTagDto> findAllTags() {
            return new ArrayList<>(tagsByName.values());
        }

        @Override
        public List<String> findTagNamesByTaskId(Long taskId) {
            return tagsByTaskId.getOrDefault(taskId, List.of());
        }

        @Override
        public void replaceTaskTags(Long taskId, List<Long> tagIds) {
            List<String> tagNames = tagIds.stream()
                    .map(this::requireTagName)
                    .toList();
            tagsByTaskId.put(taskId, new ArrayList<>(tagNames));
        }

        private boolean hasTag(Long taskId, String tagName) {
            return tagsByTaskId.getOrDefault(taskId, List.of()).contains(tagName);
        }

        private String requireTagName(Long tagId) {
            return tagsByName.values().stream()
                    .filter(tag -> tag.id().equals(tagId))
                    .findFirst()
                    .map(TaskTagDto::name)
                    .orElseThrow();
        }
    }
}
