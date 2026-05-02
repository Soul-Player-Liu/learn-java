package com.example.learning.interfaces.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Autowired
    private ObjectMapper objectMapper;

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

        ResponseEntity<JsonNode> getResponse = restTemplate.getForEntity(
                "/api/tasks/{id}", JsonNode.class, createdTask.id());
        ResponseEntity<JsonNode> patchResponse = restTemplate.exchange(
                "/api/tasks/{id}/status",
                HttpMethod.PATCH,
                new HttpEntity<>(Map.of("status", "DOING")),
                JsonNode.class,
                createdTask.id()
        );

        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(data(getResponse).get("title").asText()).isEqualTo("Learn REST");
        assertThat(patchResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(data(patchResponse).get("status").asText()).isEqualTo(TaskStatus.DOING.name());
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

        ResponseEntity<JsonNode> listResponse = restTemplate.getForEntity(
                "/api/tasks?keyword=Java&overdueOnly=true", JsonNode.class);
        ResponseEntity<JsonNode> statisticsResponse = restTemplate.getForEntity(
                "/api/tasks/statistics", JsonNode.class);

        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode items = data(listResponse).get("items");
        assertThat(items).hasSize(1);
        assertThat(items.get(0).get("title").asText()).isEqualTo("Learn Java");
        assertThat(data(listResponse).get("total").asLong()).isEqualTo(1);

        assertThat(statisticsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(data(statisticsResponse).get("total").asLong()).isEqualTo(2);
        assertThat(data(statisticsResponse).get("done").asLong()).isEqualTo(1);
        assertThat(data(statisticsResponse).get("overdue").asLong()).isEqualTo(1);
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

        ResponseEntity<JsonNode> projectTasks = restTemplate.getForEntity(
                "/api/tasks?projectId={projectId}", JsonNode.class, project.id());
        ResponseEntity<JsonNode> sqlTasks = restTemplate.getForEntity(
                "/api/tasks?tag=sql", JsonNode.class);
        ResponseEntity<JsonNode> tags = restTemplate.getForEntity("/api/tags", JsonNode.class);
        ResponseEntity<JsonNode> commentResponse = restTemplate.postForEntity(
                "/api/tasks/{id}/comments",
                Map.of("content", "接口已经完成", "author", "pm"),
                JsonNode.class,
                task.id()
        );
        ResponseEntity<JsonNode> comments = restTemplate.getForEntity(
                "/api/tasks/{id}/comments", JsonNode.class, task.id());
        ResponseEntity<JsonNode> activities = restTemplate.getForEntity(
                "/api/tasks/{id}/activities", JsonNode.class, task.id());
        ResponseEntity<JsonNode> projectDetail = restTemplate.getForEntity(
                "/api/projects/{id}", JsonNode.class, project.id());

        assertThat(task.projectId()).isEqualTo(project.id());
        assertThat(task.projectName()).isEqualTo("Backend Track");
        assertThat(task.tagNames()).containsExactly("backend", "sql");

        assertThat(data(projectTasks).get("items")).extracting(item -> item.get("title").asText())
                .containsExactly("Model project tasks");
        assertThat(data(sqlTasks).get("items")).extracting(item -> item.get("title").asText())
                .containsExactly("Model project tasks");
        assertThat(data(tags).get("items")).extracting(item -> item.get("name").asText())
                .containsExactly("backend", "sql");

        assertThat(commentResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(data(commentResponse).get("author").asText()).isEqualTo("pm");
        assertThat(data(comments).get("items")).extracting(item -> item.get("content").asText())
                .containsExactly("接口已经完成");
        assertThat(data(activities).get("items")).extracting(item -> item.get("type").asText())
                .contains("TASK_CREATED", "COMMENT_ADDED");

        assertThat(data(projectDetail).get("taskCount").asInt()).isEqualTo(1);
        assertThat(data(projectDetail).get("doneTaskCount").asInt()).isZero();
    }

    @Test
    void validationErrorUsesStructuredErrorResponseAndTraceId() {
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/tasks",
                Map.of("title", ""),
                JsonNode.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getHeaders().getFirst("X-Request-Id")).isNotBlank();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("code").asText()).isEqualTo("VALIDATION_FAILED");
        assertThat(response.getBody().get("path").asText()).isEqualTo("/api/tasks");
        assertThat(response.getBody().get("traceId").asText()).isEqualTo(response.getHeaders().getFirst("X-Request-Id"));
        assertThat(response.getBody().get("details"))
                .extracting(detail -> detail.get("field").asText())
                .contains("title");
    }

    private LearningTaskDto createTask(String title, String description, LocalDate dueDate) {
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/tasks",
                Map.of("title", title, "description", description, "dueDate", dueDate.toString()),
                JsonNode.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return convert(data(response), LearningTaskDto.class);
    }

    private LearningTaskDto createTask(Long projectId, String title, String description, LocalDate dueDate,
                                       List<String> tagNames) {
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/tasks",
                Map.of(
                        "projectId", projectId,
                        "title", title,
                        "description", description,
                        "dueDate", dueDate.toString(),
                        "tagNames", tagNames
                ),
                JsonNode.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return convert(data(response), LearningTaskDto.class);
    }

    private LearningProjectDto createProject(String name, String description) {
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/projects",
                Map.of("name", name, "description", description),
                JsonNode.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return convert(data(response), LearningProjectDto.class);
    }

    private JsonNode data(ResponseEntity<JsonNode> response) {
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("code").asText()).isEqualTo("OK");
        return response.getBody().get("data");
    }

    private <T> T convert(JsonNode node, Class<T> type) {
        try {
            return objectMapper.treeToValue(node, type);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to convert test response", ex);
        }
    }
}
