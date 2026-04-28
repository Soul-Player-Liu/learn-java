package com.example.learning.interfaces.rest;

import com.example.learning.application.dto.LearningTaskDto;
import com.example.learning.application.dto.TaskStatisticsDto;
import com.example.learning.domain.model.TaskStatus;
import com.example.learning.support.MysqlTestSchema;
import org.junit.jupiter.api.AfterAll;
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
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class LearningTaskControllerIT {

    private static final MysqlTestSchema MYSQL = MysqlTestSchema.create("controller");

    @DynamicPropertySource
    static void mysqlProperties(DynamicPropertyRegistry registry) {
        MYSQL.register(registry);
    }

    @AfterAll
    static void dropSchema() {
        MYSQL.drop();
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.update("delete from learning_task");
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
}
