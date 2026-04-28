package com.example.learning.application;

import com.example.learning.application.command.ChangeTaskStatusCommand;
import com.example.learning.application.command.CreateLearningTaskCommand;
import com.example.learning.application.command.ListLearningTasksQuery;
import com.example.learning.application.command.UpdateLearningTaskCommand;
import com.example.learning.application.dto.LearningTaskDto;
import com.example.learning.application.dto.TaskStatisticsDto;
import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.model.TaskStatus;
import com.example.learning.domain.repository.LearningTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningTaskApplicationService {

    private final LearningTaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<LearningTaskDto> listTasks(ListLearningTasksQuery query) {
        log.debug("Listing learning tasks status={} keyword={} overdueOnly={}",
                query.status(), query.normalizedKeyword(), query.isOverdueOnly());
        return taskRepository.findAll(query).stream()
                .map(LearningTaskDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public LearningTaskDto getTask(Long id) {
        log.debug("Getting learning task id={}", id);
        return taskRepository.findById(id)
                .map(LearningTaskDto::from)
                .orElseThrow(() -> new TaskNotFoundException(id));
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
        LearningTask task = LearningTask.create(command.title(), command.description(), command.dueDate());
        LearningTask savedTask = taskRepository.save(task);
        log.info("Created learning task id={}", savedTask.getId());
        return LearningTaskDto.from(savedTask);
    }

    @Transactional
    public LearningTaskDto updateTask(Long id, UpdateLearningTaskCommand command) {
        log.info("Updating learning task id={} status={}", id, command.status());
        LearningTask task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        task.rename(command.title());
        task.changeDescription(command.description());
        task.changeDueDate(command.dueDate());
        task.changeStatus(command.status());
        LearningTask savedTask = taskRepository.save(task);
        log.info("Updated learning task id={}", savedTask.getId());
        return LearningTaskDto.from(savedTask);
    }

    @Transactional
    public LearningTaskDto changeTaskStatus(Long id, ChangeTaskStatusCommand command) {
        log.info("Changing learning task status id={} status={}", id, command.status());
        LearningTask task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        task.changeStatus(command.status());
        LearningTask savedTask = taskRepository.save(task);
        log.info("Changed learning task status id={}", savedTask.getId());
        return LearningTaskDto.from(savedTask);
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
}
