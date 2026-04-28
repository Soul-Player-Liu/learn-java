package com.example.learning.domain.repository;

import com.example.learning.application.command.ListLearningTasksQuery;
import com.example.learning.domain.model.LearningTask;

import java.util.List;
import java.util.Optional;

public interface LearningTaskRepository {

    LearningTask save(LearningTask task);

    Optional<LearningTask> findById(Long id);

    List<LearningTask> findAll(ListLearningTasksQuery query);

    void deleteById(Long id);
}
