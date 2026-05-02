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
import com.example.learning.application.dto.TaskListItemDto;
import com.example.learning.application.dto.TaskStatisticsDto;
import com.example.learning.domain.model.TaskStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
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

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Validated
public class LearningTaskController {

    private final LearningTaskApplicationService taskService;

    @Operation(summary = "Page through learning tasks")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tasks found"),
            @ApiResponse(responseCode = "400", description = "Invalid query parameter")
    })
    @GetMapping
    public com.example.learning.interfaces.rest.ApiResponse<PageResponse<TaskListItemDto>> listTasks(
            @Parameter(description = "Filter by task status")
            @RequestParam(required = false) TaskStatus status,
            @Parameter(description = "Filter by project id")
            @RequestParam(required = false) Long projectId,
            @Parameter(description = "Search keyword in title or description")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Only include unfinished overdue tasks")
            @RequestParam(required = false) Boolean overdueOnly,
            @Parameter(description = "Filter by exact tag name")
            @RequestParam(required = false) String tag,
            @Parameter(description = "One-based page number")
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return RestResponses.ok(PageResponse.from(taskService.listTasks(
                new ListLearningTasksQuery(status, projectId, keyword, overdueOnly, tag, page, size))));
    }

    @Operation(summary = "Get one learning task")
    @GetMapping("/{id}")
    public com.example.learning.interfaces.rest.ApiResponse<LearningTaskDto> getTask(@PathVariable Long id) {
        return RestResponses.ok(taskService.getTask(id));
    }

    @Operation(summary = "Get task statistics")
    @GetMapping("/statistics")
    public com.example.learning.interfaces.rest.ApiResponse<TaskStatisticsDto> getTaskStatistics() {
        return RestResponses.ok(taskService.getStatistics());
    }

    @Operation(summary = "Create a learning task")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public com.example.learning.interfaces.rest.ApiResponse<LearningTaskDto> createTask(
            @Valid @RequestBody CreateLearningTaskRequest request) {
        return RestResponses.ok(taskService.createTask(new CreateLearningTaskCommand(
                request.projectId(),
                request.title(),
                request.description(),
                request.dueDate(),
                request.tagNames()
        )));
    }

    @Operation(summary = "Update a learning task")
    @PutMapping("/{id}")
    public com.example.learning.interfaces.rest.ApiResponse<LearningTaskDto> updateTask(
            @PathVariable Long id, @Valid @RequestBody UpdateLearningTaskRequest request) {
        return RestResponses.ok(taskService.updateTask(id, new UpdateLearningTaskCommand(
                request.projectId(),
                request.title(),
                request.description(),
                request.status(),
                request.dueDate(),
                request.tagNames()
        )));
    }

    @Operation(summary = "Change task status")
    @PatchMapping("/{id}/status")
    public com.example.learning.interfaces.rest.ApiResponse<LearningTaskDto> changeTaskStatus(
            @PathVariable Long id, @Valid @RequestBody ChangeTaskStatusRequest request) {
        return RestResponses.ok(taskService.changeTaskStatus(id, new ChangeTaskStatusCommand(request.status())));
    }

    @Operation(summary = "Delete a learning task")
    @DeleteMapping("/{id}")
    public com.example.learning.interfaces.rest.ApiResponse<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return RestResponses.ok(null);
    }

    @Operation(summary = "Page through task comments")
    @GetMapping("/{id}/comments")
    public com.example.learning.interfaces.rest.ApiResponse<PageResponse<TaskCommentDto>> listComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return RestResponses.ok(PageResponse.fromList(taskService.listComments(id), page, size));
    }

    @Operation(summary = "Add a task comment")
    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public com.example.learning.interfaces.rest.ApiResponse<TaskCommentDto> addComment(
            @PathVariable Long id, @Valid @RequestBody CreateTaskCommentRequest request) {
        return RestResponses.ok(taskService.addComment(id, new CreateTaskCommentCommand(request.content(), request.author())));
    }

    @Operation(summary = "Page through task activities")
    @GetMapping("/{id}/activities")
    public com.example.learning.interfaces.rest.ApiResponse<PageResponse<TaskActivityDto>> listActivities(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return RestResponses.ok(PageResponse.fromList(taskService.listActivities(id), page, size));
    }
}
