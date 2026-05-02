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
import com.example.learning.application.query.LearningTaskQueryRepository;
import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.model.TaskStatus;
import com.example.learning.domain.repository.LearningTaskRepository;
import com.example.learning.infrastructure.persistence.LearningProjectRecord;
import com.example.learning.infrastructure.persistence.LearningTagRecord;
import com.example.learning.infrastructure.persistence.LearningWorkspaceMapper;
import com.example.learning.infrastructure.persistence.TaskActivityRecord;
import com.example.learning.infrastructure.persistence.TaskCommentRecord;
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
    private FakeLearningWorkspaceMapper workspaceMapper;
    private LearningTaskApplicationService service;

    @BeforeEach
    void setUp() {
        workspaceMapper = new FakeLearningWorkspaceMapper();
        repository = new FakeLearningTaskRepository(workspaceMapper);
        service = new LearningTaskApplicationService(repository, new FakeLearningTaskQueryRepository(repository, workspaceMapper),
                workspaceMapper);
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
        private final FakeLearningWorkspaceMapper workspaceMapper;
        private long nextId = 1;

        private FakeLearningTaskRepository(FakeLearningWorkspaceMapper workspaceMapper) {
            this.workspaceMapper = workspaceMapper;
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
        public List<LearningTask> findAll(ListLearningTasksQuery query) {
            String keyword = query.normalizedKeyword();
            String tag = query.normalizedTag();
            return new ArrayList<>(tasks.values()).stream()
                    .filter(task -> query.status() == null || task.getStatus() == query.status())
                    .filter(task -> query.projectId() == null || query.projectId().equals(task.getProjectId()))
                    .filter(task -> keyword == null || contains(task.getTitle(), keyword)
                            || contains(task.getDescription(), keyword))
                    .filter(task -> !query.isOverdueOnly() || isOverdue(task))
                    .filter(task -> tag == null || workspaceMapper.hasTag(task.getId(), tag))
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
        private final FakeLearningWorkspaceMapper workspaceMapper;

        private FakeLearningTaskQueryRepository(FakeLearningTaskRepository repository,
                                                FakeLearningWorkspaceMapper workspaceMapper) {
            this.repository = repository;
            this.workspaceMapper = workspaceMapper;
        }

        @Override
        public long count(ListLearningTasksQuery query) {
            return repository.findAll(query).size();
        }

        @Override
        public List<TaskListItemDto> findPage(ListLearningTasksQuery query) {
            List<LearningTask> tasks = repository.findAll(query);
            int fromIndex = Math.min(query.offset(), tasks.size());
            int toIndex = Math.min(fromIndex + query.limit(), tasks.size());
            return tasks.subList(fromIndex, toIndex).stream()
                    .map(task -> new TaskListItemDto(
                            task.getId(),
                            task.getProjectId(),
                            task.getProjectId() == null ? null : workspaceMapper.findProjectNameById(task.getProjectId()),
                            task.getTitle(),
                            task.getDescription(),
                            task.getStatus(),
                            task.getDueDate(),
                            workspaceMapper.findTagNamesByTaskId(task.getId()),
                            workspaceMapper.findCommentsByTaskId(task.getId()).size(),
                            workspaceMapper.findActivitiesByTaskId(task.getId()).stream()
                                    .map(TaskActivityRecord::getCreatedAt)
                                    .max(LocalDateTime::compareTo)
                                    .orElse(null),
                            task.getCreatedAt(),
                            task.getUpdatedAt()
                    ))
                    .toList();
        }
    }

    private static final class FakeLearningWorkspaceMapper implements LearningWorkspaceMapper {

        private final Map<Long, LearningProjectRecord> projects = new LinkedHashMap<>();
        private final Map<Long, List<String>> tagsByTaskId = new HashMap<>();
        private final Map<String, LearningTagRecord> tagsByName = new LinkedHashMap<>();
        private final Map<Long, List<TaskCommentRecord>> commentsByTaskId = new HashMap<>();
        private final Map<Long, List<TaskActivityRecord>> activitiesByTaskId = new HashMap<>();
        private long nextProjectId = 1;
        private long nextTagId = 1;
        private long nextCommentId = 1;
        private long nextActivityId = 1;

        @Override
        public int insertProject(LearningProjectRecord record) {
            record.setId(nextProjectId++);
            projects.put(record.getId(), record);
            return 1;
        }

        @Override
        public LearningProjectRecord findProjectById(Long id) {
            LearningProjectRecord record = projects.get(id);
            if (record != null) {
                record.setTaskCount(0);
                record.setDoneTaskCount(0);
            }
            return record;
        }

        @Override
        public List<LearningProjectRecord> findAllProjects() {
            return new ArrayList<>(projects.values());
        }

        @Override
        public String findProjectNameById(Long id) {
            LearningProjectRecord project = projects.get(id);
            return project == null ? null : project.getName();
        }

        @Override
        public int insertComment(TaskCommentRecord record) {
            record.setId(nextCommentId++);
            commentsByTaskId.computeIfAbsent(record.getTaskId(), key -> new ArrayList<>()).add(0, record);
            return 1;
        }

        @Override
        public List<TaskCommentRecord> findCommentsByTaskId(Long taskId) {
            return commentsByTaskId.getOrDefault(taskId, List.of());
        }

        @Override
        public int insertActivity(TaskActivityRecord record) {
            record.setId(nextActivityId++);
            activitiesByTaskId.computeIfAbsent(record.getTaskId(), key -> new ArrayList<>()).add(0, record);
            return 1;
        }

        @Override
        public List<TaskActivityRecord> findActivitiesByTaskId(Long taskId) {
            return activitiesByTaskId.getOrDefault(taskId, List.of());
        }

        @Override
        public LearningTagRecord findTagByName(String name) {
            return tagsByName.get(name);
        }

        @Override
        public int insertTag(LearningTagRecord record) {
            record.setId(nextTagId++);
            if (record.getCreatedAt() == null) {
                record.setCreatedAt(LocalDateTime.now());
            }
            tagsByName.put(record.getName(), record);
            return 1;
        }

        @Override
        public List<LearningTagRecord> findAllTags() {
            return new ArrayList<>(tagsByName.values());
        }

        @Override
        public List<String> findTagNamesByTaskId(Long taskId) {
            return tagsByTaskId.getOrDefault(taskId, List.of());
        }

        @Override
        public int deleteTaskTags(Long taskId) {
            tagsByTaskId.remove(taskId);
            return 1;
        }

        @Override
        public int insertTaskTag(Long taskId, Long tagId) {
            String tagName = tagsByName.values().stream()
                    .filter(tag -> tag.getId().equals(tagId))
                    .findFirst()
                    .map(LearningTagRecord::getName)
                    .orElseThrow();
            tagsByTaskId.computeIfAbsent(taskId, key -> new ArrayList<>()).add(tagName);
            return 1;
        }

        private boolean hasTag(Long taskId, String tagName) {
            return tagsByTaskId.getOrDefault(taskId, List.of()).contains(tagName);
        }
    }
}
