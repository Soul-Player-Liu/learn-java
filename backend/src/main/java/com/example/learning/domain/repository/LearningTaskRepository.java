package com.example.learning.domain.repository;

import com.example.learning.domain.model.LearningTask;

import java.util.List;
import java.util.Optional;

public interface LearningTaskRepository {

    LearningTask save(LearningTask task);

    Optional<LearningTask> findById(Long id);

    List<LearningTask> findAll();

    void deleteById(Long id);
}
