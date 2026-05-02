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
        return taskService.listTasks(new ListLearningTasksQuery(status, projectId, keyword, overdueOnly, tag));
    }

    @GetMapping("/{id}")
    public LearningTaskDto getTask(@PathVariable Long id) {
        return taskService.getTask(id);
    }

    @GetMapping("/statistics")
    public TaskStatisticsDto getTaskStatistics() {
        return taskService.getStatistics();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LearningTaskDto createTask(@Valid @RequestBody CreateLearningTaskRequest request) {
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
        return taskService.changeTaskStatus(id, new ChangeTaskStatusCommand(request.status()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @GetMapping("/{id}/comments")
    public List<TaskCommentDto> listComments(@PathVariable Long id) {
        return taskService.listComments(id);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskCommentDto addComment(@PathVariable Long id, @Valid @RequestBody CreateTaskCommentRequest request) {
        return taskService.addComment(id, new CreateTaskCommentCommand(request.content(), request.author()));
    }

    @GetMapping("/{id}/activities")
    public List<TaskActivityDto> listActivities(@PathVariable Long id) {
        return taskService.listActivities(id);
    }
}
