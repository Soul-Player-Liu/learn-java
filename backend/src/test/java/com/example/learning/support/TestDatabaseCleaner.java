package com.example.learning.support;

import org.springframework.jdbc.core.JdbcTemplate;

public final class TestDatabaseCleaner {

    private TestDatabaseCleaner() {
    }

    public static void cleanLearningTaskTables(JdbcTemplate jdbcTemplate) {
        jdbcTemplate.update("delete from task_activity");
        jdbcTemplate.update("delete from task_comment");
        jdbcTemplate.update("delete from learning_task_tag");
        jdbcTemplate.update("delete from learning_task");
        jdbcTemplate.update("delete from learning_tag");
        jdbcTemplate.update("delete from learning_project");
    }
}
