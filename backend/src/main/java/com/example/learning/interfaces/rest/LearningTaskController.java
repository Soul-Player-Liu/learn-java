package com.example.learning.interfaces.rest;

import com.example.learning.application.command.ChangeTaskStatusCommand;
import com.example.learning.application.LearningTaskApplicationService;
import com.example.learning.application.command.CreateLearningTaskCommand;
import com.example.learning.application.command.CreateTaskCommentCommand;
import com.example.learning.application.command.ListLearningTasksQuery;
import com.example.learning.application.command.UpdateLearningTaskCommand;
import com.example.learning.application.dto.LearningTaskDto;
import com.example.learning.application.dto.TaskActivityDto;
import com.example.learning.application.dto.TaskCommentDto;
import com.example.learning.application.dto.TaskStatisticsDto;
import com.example.learning.domain.model.TaskStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public List<LearningTaskDto> listTasks(@RequestParam(required = false) TaskStatus status,
                                           @RequestParam(required = false) Long projectId,
                                           @RequestParam(required = false) String keyword,
                                           @RequestParam(required = false) Boolean overdueOnly,
                                           @RequestParam(required = false) String tag) {
        log.debug("HTTP GET /api/tasks status={} projectId={} keyword={} overdueOnly={} tag={}",
                status, projectId, keyword, overdueOnly, tag);
        return taskService.listTasks(new ListLearningTasksQuery(status, projectId, keyword, overdueOnly, tag));
    }

    @GetMapping("/{id}")
    public LearningTaskDto getTask(@PathVariable Long id) {
        log.debug("HTTP GET /api/tasks/{}", id);
        return taskService.getTask(id);
    }

    @GetMapping("/statistics")
    public TaskStatisticsDto getTaskStatistics() {
        log.debug("HTTP GET /api/tasks/statistics");
        return taskService.getStatistics();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LearningTaskDto createTask(@Valid @RequestBody CreateLearningTaskRequest request) {
        log.debug("HTTP POST /api/tasks title={}", request.title());
        return taskService.createTask(new CreateLearningTaskCommand(
                request.projectId(),
                request.title(),
                request.description(),
                request.dueDate(),
                request.tagNames()
        ));
    }

    @PutMapping("/{id}")
    public LearningTaskDto updateTask(@PathVariable Long id, @Valid @RequestBody UpdateLearningTaskRequest request) {
        log.debug("HTTP PUT /api/tasks/{} status={}", id, request.status());
        return taskService.updateTask(id, new UpdateLearningTaskCommand(
                request.projectId(),
                request.title(),
                request.description(),
                request.status(),
                request.dueDate(),
                request.tagNames()
        ));
    }

    @PatchMapping("/{id}/status")
    public LearningTaskDto changeTaskStatus(@PathVariable Long id, @Valid @RequestBody ChangeTaskStatusRequest request) {
        log.debug("HTTP PATCH /api/tasks/{}/status status={}", id, request.status());
        return taskService.changeTaskStatus(id, new ChangeTaskStatusCommand(request.status()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        log.debug("HTTP DELETE /api/tasks/{}", id);
        taskService.deleteTask(id);
    }

    @GetMapping("/{id}/comments")
    public List<TaskCommentDto> listComments(@PathVariable Long id) {
        log.debug("HTTP GET /api/tasks/{}/comments", id);
        return taskService.listComments(id);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskCommentDto addComment(@PathVariable Long id, @Valid @RequestBody CreateTaskCommentRequest request) {
        log.debug("HTTP POST /api/tasks/{}/comments", id);
        return taskService.addComment(id, new CreateTaskCommentCommand(request.content(), request.author()));
    }

    @GetMapping("/{id}/activities")
    public List<TaskActivityDto> listActivities(@PathVariable Long id) {
        log.debug("HTTP GET /api/tasks/{}/activities", id);
        return taskService.listActivities(id);
    }
}
