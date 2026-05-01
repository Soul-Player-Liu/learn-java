package com.example.learning.infrastructure.persistence;

import com.example.learning.domain.model.TaskStatus;
import com.example.learning.support.MysqlTestSchema;
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

    private static final MysqlTestSchema MYSQL = MysqlTestSchema.shared();

    @DynamicPropertySource
    static void mysqlProperties(DynamicPropertyRegistry registry) {
        MYSQL.register(registry);
    }

    @Autowired
    private LearningTaskMapper mapper;

    @Autowired
    private LearningWorkspaceMapper workspaceMapper;

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

        List<MyBatisLearningTaskRecord> javaTodoTasks = mapper.findAll(TaskStatus.TODO, null, "Java", false, null);
        List<MyBatisLearningTaskRecord> overdueTasks = mapper.findAll(null, null, null, true, null);

        assertThat(javaTodoTasks)
                .extracting(MyBatisLearningTaskRecord::getTitle)
                .containsExactly("Learn Java");
        assertThat(overdueTasks)
                .extracting(MyBatisLearningTaskRecord::getTitle)
                .containsExactly("Learn Java");
    }

    @Test
    void findAllAppliesProjectAndTagFilters() {
        LearningProjectRecord project = project("Backend");
        workspaceMapper.insertProject(project);

        MyBatisLearningTaskRecord taggedTask = task(
                "Design persistence", "Project scoped", TaskStatus.TODO, LocalDate.now().plusDays(1));
        taggedTask.setProjectId(project.getId());
        mapper.insert(taggedTask);
        mapper.insert(task("Build frontend", "Unscoped", TaskStatus.TODO, LocalDate.now().plusDays(1)));

        LearningTagRecord tag = tag("sql");
        workspaceMapper.insertTag(tag);
        workspaceMapper.insertTaskTag(taggedTask.getId(), tag.getId());

        List<MyBatisLearningTaskRecord> projectTasks = mapper.findAll(null, project.getId(), null, false, null);
        List<MyBatisLearningTaskRecord> sqlTasks = mapper.findAll(null, null, null, false, "sql");

        assertThat(projectTasks)
                .extracting(MyBatisLearningTaskRecord::getTitle)
                .containsExactly("Design persistence");
        assertThat(sqlTasks)
                .extracting(MyBatisLearningTaskRecord::getTitle)
                .containsExactly("Design persistence");
    }

    @Test
    void workspaceMapperRoundTripsProjectsTagsCommentsAndActivities() {
        LearningProjectRecord project = project("Release Plan");
        workspaceMapper.insertProject(project);

        MyBatisLearningTaskRecord task = task("Ship milestone", "Coordinate work", TaskStatus.DONE, LocalDate.now());
        task.setProjectId(project.getId());
        mapper.insert(task);

        LearningTagRecord tag = tag("release");
        workspaceMapper.insertTag(tag);
        workspaceMapper.insertTaskTag(task.getId(), tag.getId());

        TaskCommentRecord comment = comment(task.getId(), "Ready for review");
        workspaceMapper.insertComment(comment);
        TaskActivityRecord activity = activity(task.getId(), "COMMENT_ADDED", "Comment added");
        workspaceMapper.insertActivity(activity);

        LearningProjectRecord savedProject = workspaceMapper.findProjectById(project.getId());

        assertThat(savedProject.getTaskCount()).isEqualTo(1);
        assertThat(savedProject.getDoneTaskCount()).isEqualTo(1);
        assertThat(workspaceMapper.findTagNamesByTaskId(task.getId())).containsExactly("release");
        assertThat(workspaceMapper.findCommentsByTaskId(task.getId()))
                .extracting(TaskCommentRecord::getContent)
                .containsExactly("Ready for review");
        assertThat(workspaceMapper.findActivitiesByTaskId(task.getId()))
                .extracting(TaskActivityRecord::getType)
                .containsExactly("COMMENT_ADDED");
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

    private LearningProjectRecord project(String name) {
        LocalDateTime now = LocalDateTime.now();
        LearningProjectRecord record = new LearningProjectRecord();
        record.setName(name);
        record.setDescription(name + " description");
        record.setCreatedAt(now);
        record.setUpdatedAt(now);
        return record;
    }

    private LearningTagRecord tag(String name) {
        LearningTagRecord record = new LearningTagRecord();
        record.setName(name);
        record.setColor("#2563eb");
        record.setCreatedAt(LocalDateTime.now());
        return record;
    }

    private TaskCommentRecord comment(Long taskId, String content) {
        TaskCommentRecord record = new TaskCommentRecord();
        record.setTaskId(taskId);
        record.setContent(content);
        record.setAuthor("integration-test");
        record.setCreatedAt(LocalDateTime.now());
        return record;
    }

    private TaskActivityRecord activity(Long taskId, String type, String message) {
        TaskActivityRecord record = new TaskActivityRecord();
        record.setTaskId(taskId);
        record.setType(type);
        record.setMessage(message);
        record.setCreatedAt(LocalDateTime.now());
        return record;
    }
}
