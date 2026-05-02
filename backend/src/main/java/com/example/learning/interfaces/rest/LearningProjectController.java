package com.example.learning.interfaces.rest;

import com.example.learning.application.LearningTaskApplicationService;
import com.example.learning.application.command.CreateLearningProjectCommand;
import com.example.learning.application.dto.LearningProjectDto;
import com.example.learning.application.dto.TaskTagDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
public class LearningProjectController {

    private final LearningTaskApplicationService taskService;

    @Operation(summary = "Page through learning projects")
    @GetMapping("/api/projects")
    public ApiResponse<PageResponse<LearningProjectDto>> listProjects(
            @Parameter(description = "One-based page number")
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "1") @Min(1) int page,
            @Parameter(description = "Page size")
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return RestResponses.ok(PageResponse.fromList(taskService.listProjects(), page, size));
    }

    @Operation(summary = "Get one learning project")
    @GetMapping("/api/projects/{id}")
    public ApiResponse<LearningProjectDto> getProject(@PathVariable Long id) {
        return RestResponses.ok(taskService.getProject(id));
    }

    @Operation(summary = "Create a learning project")
    @PostMapping("/api/projects")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LearningProjectDto> createProject(@Valid @RequestBody CreateLearningProjectRequest request) {
        return RestResponses.ok(taskService.createProject(new CreateLearningProjectCommand(request.name(), request.description())));
    }

    @Operation(summary = "Page through tags")
    @GetMapping("/api/tags")
    public ApiResponse<PageResponse<TaskTagDto>> listTags(
            @Parameter(description = "One-based page number")
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "1") @Min(1) int page,
            @Parameter(description = "Page size")
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return RestResponses.ok(PageResponse.fromList(taskService.listTags(), page, size));
    }
}
