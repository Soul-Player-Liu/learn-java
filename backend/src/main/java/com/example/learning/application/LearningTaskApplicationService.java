package com.example.learning.application;

import com.example.learning.application.command.CreateLearningTaskCommand;
import com.example.learning.application.command.UpdateLearningTaskCommand;
import com.example.learning.application.dto.LearningTaskDto;
import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.repository.LearningTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningTaskApplicationService {

    private final LearningTaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<LearningTaskDto> listTasks() {
        log.debug("Listing learning tasks");
        return taskRepository.findAll().stream()
                .map(LearningTaskDto::from)
                .toList();
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
    public void deleteTask(Long id) {
        log.info("Deleting learning task id={}", id);
        if (taskRepository.findById(id).isEmpty()) {
            throw new TaskNotFoundException(id);
        }
        taskRepository.deleteById(id);
        log.info("Deleted learning task id={}", id);
    }
}
