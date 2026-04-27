package com.example.learning.interfaces.rest;

import com.example.learning.application.LearningTaskApplicationService;
import com.example.learning.application.command.CreateLearningTaskCommand;
import com.example.learning.application.command.UpdateLearningTaskCommand;
import com.example.learning.application.dto.LearningTaskDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class LearningTaskController {

    private final LearningTaskApplicationService taskService;

    @GetMapping
    public List<LearningTaskDto> listTasks() {
        log.debug("HTTP GET /api/tasks");
        return taskService.listTasks();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LearningTaskDto createTask(@Valid @RequestBody CreateLearningTaskRequest request) {
        log.debug("HTTP POST /api/tasks title={}", request.title());
        return taskService.createTask(new CreateLearningTaskCommand(
                request.title(),
                request.description(),
                request.dueDate()
        ));
    }

    @PutMapping("/{id}")
    public LearningTaskDto updateTask(@PathVariable Long id, @Valid @RequestBody UpdateLearningTaskRequest request) {
        log.debug("HTTP PUT /api/tasks/{} status={}", id, request.status());
        return taskService.updateTask(id, new UpdateLearningTaskCommand(
                request.title(),
                request.description(),
                request.status(),
                request.dueDate()
        ));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        log.debug("HTTP DELETE /api/tasks/{}", id);
        taskService.deleteTask(id);
    }
}
