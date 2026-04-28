package com.example.learning.application;

import com.example.learning.application.command.ChangeTaskStatusCommand;
import com.example.learning.application.command.CreateLearningTaskCommand;
import com.example.learning.application.command.ListLearningTasksQuery;
import com.example.learning.application.dto.LearningTaskDto;
import com.example.learning.application.dto.TaskStatisticsDto;
import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.model.TaskStatus;
import com.example.learning.domain.repository.LearningTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LearningTaskApplicationServiceTest {

    private FakeLearningTaskRepository repository;
    private LearningTaskApplicationService service;

    @BeforeEach
    void setUp() {
        repository = new FakeLearningTaskRepository();
        service = new LearningTaskApplicationService(repository);
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
        private long nextId = 1;

        @Override
        public LearningTask save(LearningTask task) {
            LearningTask savedTask = task.getId() == null
                    ? LearningTask.restore(nextId++, task.getTitle(), task.getDescription(), task.getStatus(),
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
            return new ArrayList<>(tasks.values()).stream()
                    .filter(task -> query.status() == null || task.getStatus() == query.status())
                    .filter(task -> keyword == null || contains(task.getTitle(), keyword)
                            || contains(task.getDescription(), keyword))
                    .filter(task -> !query.isOverdueOnly() || isOverdue(task))
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
}
