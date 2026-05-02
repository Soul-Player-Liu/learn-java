package com.example.learning.interfaces.rest;

import com.example.learning.application.LearningTaskApplicationService;
import com.example.learning.application.command.CreateLearningProjectCommand;
import com.example.learning.application.dto.LearningProjectDto;
import com.example.learning.application.dto.TaskTagDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
public class LearningProjectController {

    private final LearningTaskApplicationService taskService;

    @GetMapping("/api/projects")
    public List<LearningProjectDto> listProjects() {
        return taskService.listProjects();
    }

    @GetMapping("/api/projects/{id}")
    public LearningProjectDto getProject(@PathVariable Long id) {
        return taskService.getProject(id);
    }

    @PostMapping("/api/projects")
    @ResponseStatus(HttpStatus.CREATED)
    public LearningProjectDto createProject(@Valid @RequestBody CreateLearningProjectRequest request) {
        return taskService.createProject(new CreateLearningProjectCommand(request.name(), request.description()));
    }

    @GetMapping("/api/tags")
    public List<TaskTagDto> listTags() {
        return taskService.listTags();
    }
}
