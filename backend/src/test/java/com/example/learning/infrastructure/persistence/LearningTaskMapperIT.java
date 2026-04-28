package com.example.learning.infrastructure.persistence;

import com.example.learning.domain.model.TaskStatus;
import com.example.learning.support.MysqlTestSchema;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class LearningTaskMapperIT {

    private static final MysqlTestSchema MYSQL = MysqlTestSchema.create("mapper");

    @DynamicPropertySource
    static void mysqlProperties(DynamicPropertyRegistry registry) {
        MYSQL.register(registry);
    }

    @AfterAll
    static void dropSchema() {
        MYSQL.drop();
    }

    @Autowired
    private LearningTaskMapper mapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.update("delete from learning_task");
    }

    @Test
    void insertAndFindByIdRoundTripsTaskRecord() {
        MyBatisLearningTaskRecord record = task("Learn MyBatis", "Mapper XML", TaskStatus.TODO, LocalDate.now());

        mapper.insert(record);

        MyBatisLearningTaskRecord savedRecord = mapper.findById(record.getId());
        assertThat(savedRecord.getTitle()).isEqualTo("Learn MyBatis");
        assertThat(savedRecord.getStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(savedRecord.getDueDate()).isEqualTo(LocalDate.now());
    }

    @Test
    void findAllAppliesStatusKeywordAndOverdueFilters() {
        mapper.insert(task("Learn Java", "Read service code", TaskStatus.TODO, LocalDate.now().minusDays(1)));
        mapper.insert(task("Learn Vue", "Build pages", TaskStatus.DOING, LocalDate.now().plusDays(1)));
        mapper.insert(task("Write notes", "Java review", TaskStatus.DONE, LocalDate.now().minusDays(2)));

        List<MyBatisLearningTaskRecord> javaTodoTasks = mapper.findAll(TaskStatus.TODO, "Java", false);
        List<MyBatisLearningTaskRecord> overdueTasks = mapper.findAll(null, null, true);

        assertThat(javaTodoTasks)
                .extracting(MyBatisLearningTaskRecord::getTitle)
                .containsExactly("Learn Java");
        assertThat(overdueTasks)
                .extracting(MyBatisLearningTaskRecord::getTitle)
                .containsExactly("Learn Java");
    }

    private MyBatisLearningTaskRecord task(String title, String description, TaskStatus status, LocalDate dueDate) {
        LocalDateTime now = LocalDateTime.now();
        MyBatisLearningTaskRecord record = new MyBatisLearningTaskRecord();
        record.setTitle(title);
        record.setDescription(description);
        record.setStatus(status);
        record.setDueDate(dueDate);
        record.setCreatedAt(now);
        record.setUpdatedAt(now);
        return record;
    }
}
