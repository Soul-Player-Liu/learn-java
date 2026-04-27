package com.example.learning.domain.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LearningTaskTest {

    @Test
    void createTaskDefaultsToTodo() {
        LearningTask task = LearningTask.create("Learn Java", "Read DDD layers", null);

        assertThat(task.getTitle()).isEqualTo("Learn Java");
        assertThat(task.getStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(task.getCreatedAt()).isNotNull();
    }

    @Test
    void titleCannotBeBlank() {
        assertThatThrownBy(() -> LearningTask.create(" ", null, null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
