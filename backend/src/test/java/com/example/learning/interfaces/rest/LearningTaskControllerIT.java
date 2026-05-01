package com.example.learning.interfaces.rest;

import com.example.learning.application.dto.LearningProjectDto;
import com.example.learning.application.dto.TaskActivityDto;
import com.example.learning.application.dto.TaskCommentDto;
import com.example.learning.application.dto.LearningTaskDto;
import com.example.learning.application.dto.TaskStatisticsDto;
import com.example.learning.application.dto.TaskTagDto;
import com.example.learning.domain.model.TaskStatus;
import com.example.learning.support.MysqlTestSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class LearningTaskControllerIT {

    private static final MysqlTestSchema MYSQL = MysqlTestSchema.shared();

    @DynamicPropertySource
    static void mysqlProperties(DynamicPropertyRegistry registry) {
        MYSQL.register(registry);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.update("delete from task_activity");
        jdbcTemplate.update("delete from task_comment");
        jdbcTemplate.update("delete from learning_task_tag");
        jdbcTemplate.update("delete from learning_task");
        jdbcTemplate.update("delete from learning_tag");
        jdbcTemplate.update("delete from learning_project");
    }

    @Test
    void createGetAndChangeTaskStatusThroughHttpApi() {
        LearningTaskDto createdTask = createTask("Learn REST", "Call controller", LocalDate.now().plusDays(1));

        ResponseEntity<LearningTaskDto> getResponse = restTemplate.getForEntity(
                "/api/tasks/{id}", LearningTaskDto.class, createdTask.id());
        ResponseEntity<LearningTaskDto> patchResponse = restTemplate.exchange(
                "/api/tasks/{id}/status",
                HttpMethod.PATCH,
                new HttpEntity<>(Map.of("status", "DOING")),
                LearningTaskDto.class,
                createdTask.id()
        );

        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody()).isNotNull();
        assertThat(getResponse.getBody().title()).isEqualTo("Learn REST");
        assertThat(patchResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(patchResponse.getBody()).isNotNull();
        assertThat(patchResponse.getBody().status()).isEqualTo(TaskStatus.DOING);
    }

    @Test
    void listAndStatisticsUseMysqlBackedData() {
        createTask("Learn Java", "Search keyword", LocalDate.now().minusDays(1));
        LearningTaskDto vueTask = createTask("Learn Vue", "Build UI", LocalDate.now().plusDays(2));
        restTemplate.exchange(
                "/api/tasks/{id}/status",
                HttpMethod.PATCH,
                new HttpEntity<>(Map.of("status", "DONE")),
                LearningTaskDto.class,
                vueTask.id()
        );

        ResponseEntity<LearningTaskDto[]> listResponse = restTemplate.getForEntity(
                "/api/tasks?keyword=Java&overdueOnly=true", LearningTaskDto[].class);
        ResponseEntity<TaskStatisticsDto> statisticsResponse = restTemplate.getForEntity(
                "/api/tasks/statistics", TaskStatisticsDto.class);

        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResponse.getBody()).isNotNull();
        assertThat(listResponse.getBody()).hasSize(1);
        assertThat(listResponse.getBody()[0].title()).isEqualTo("Learn Java");

        assertThat(statisticsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(statisticsResponse.getBody()).isNotNull();
        assertThat(statisticsResponse.getBody().total()).isEqualTo(2);
        assertThat(statisticsResponse.getBody().done()).isEqualTo(1);
        assertThat(statisticsResponse.getBody().overdue()).isEqualTo(1);
    }

    @Test
    void projectTagsCommentsAndActivitiesWorkThroughHttpApi() {
        LearningProjectDto project = createProject("Backend Track", "Persistence and API work");
        LearningTaskDto task = createTask(
                project.id(),
                "Model project tasks",
                "Add project and labels",
                LocalDate.now().plusDays(3),
                List.of("backend", "sql")
        );

        ResponseEntity<LearningTaskDto[]> projectTasks = restTemplate.getForEntity(
                "/api/tasks?projectId={projectId}", LearningTaskDto[].class, project.id());
        ResponseEntity<LearningTaskDto[]> sqlTasks = restTemplate.getForEntity(
                "/api/tasks?tag=sql", LearningTaskDto[].class);
        ResponseEntity<TaskTagDto[]> tags = restTemplate.getForEntity("/api/tags", TaskTagDto[].class);
        ResponseEntity<TaskCommentDto> commentResponse = restTemplate.postForEntity(
                "/api/tasks/{id}/comments",
                Map.of("content", "接口已经完成", "author", "pm"),
                TaskCommentDto.class,
                task.id()
        );
        ResponseEntity<TaskCommentDto[]> comments = restTemplate.getForEntity(
                "/api/tasks/{id}/comments", TaskCommentDto[].class, task.id());
        ResponseEntity<TaskActivityDto[]> activities = restTemplate.getForEntity(
                "/api/tasks/{id}/activities", TaskActivityDto[].class, task.id());
        ResponseEntity<LearningProjectDto> projectDetail = restTemplate.getForEntity(
                "/api/projects/{id}", LearningProjectDto.class, project.id());

        assertThat(task.projectId()).isEqualTo(project.id());
        assertThat(task.projectName()).isEqualTo("Backend Track");
        assertThat(task.tagNames()).containsExactly("backend", "sql");

        assertThat(projectTasks.getBody()).isNotNull();
        assertThat(projectTasks.getBody()).extracting(LearningTaskDto::title).containsExactly("Model project tasks");
        assertThat(sqlTasks.getBody()).isNotNull();
        assertThat(sqlTasks.getBody()).extracting(LearningTaskDto::title).containsExactly("Model project tasks");
        assertThat(tags.getBody()).isNotNull();
        assertThat(tags.getBody()).extracting(TaskTagDto::name).containsExactly("backend", "sql");

        assertThat(commentResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(commentResponse.getBody()).isNotNull();
        assertThat(commentResponse.getBody().author()).isEqualTo("pm");
        assertThat(comments.getBody()).isNotNull();
        assertThat(comments.getBody()).extracting(TaskCommentDto::content).containsExactly("接口已经完成");
        assertThat(activities.getBody()).isNotNull();
        assertThat(activities.getBody()).extracting(TaskActivityDto::type)
                .contains("TASK_CREATED", "COMMENT_ADDED");

        assertThat(projectDetail.getBody()).isNotNull();
        assertThat(projectDetail.getBody().taskCount()).isEqualTo(1);
        assertThat(projectDetail.getBody().doneTaskCount()).isZero();
    }

    private LearningTaskDto createTask(String title, String description, LocalDate dueDate) {
        ResponseEntity<LearningTaskDto> response = restTemplate.postForEntity(
                "/api/tasks",
                Map.of("title", title, "description", description, "dueDate", dueDate.toString()),
                LearningTaskDto.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return response.getBody();
    }

    private LearningTaskDto createTask(Long projectId, String title, String description, LocalDate dueDate,
                                       List<String> tagNames) {
        ResponseEntity<LearningTaskDto> response = restTemplate.postForEntity(
                "/api/tasks",
                Map.of(
                        "projectId", projectId,
                        "title", title,
                        "description", description,
                        "dueDate", dueDate.toString(),
                        "tagNames", tagNames
                ),
                LearningTaskDto.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return response.getBody();
    }

    private LearningProjectDto createProject(String name, String description) {
        ResponseEntity<LearningProjectDto> response = restTemplate.postForEntity(
                "/api/projects",
                Map.of("name", name, "description", description),
                LearningProjectDto.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return response.getBody();
    }
}
