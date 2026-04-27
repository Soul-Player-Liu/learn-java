package com.example.learning.infrastructure.persistence;

import com.example.learning.domain.model.LearningTask;
import com.example.learning.domain.repository.LearningTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class MyBatisLearningTaskRepository implements LearningTaskRepository {

    private final LearningTaskMapper mapper;

    @Override
    public LearningTask save(LearningTask task) {
        MyBatisLearningTaskRecord record = MyBatisLearningTaskRecord.fromDomain(task);
        if (record.getId() == null) {
            mapper.insert(record);
            log.debug("Inserted learning task record id={}", record.getId());
        } else {
            mapper.update(record);
            log.debug("Updated learning task record id={}", record.getId());
        }
        return record.toDomain();
    }

    @Override
    public Optional<LearningTask> findById(Long id) {
        log.debug("Finding learning task record id={}", id);
        return Optional.ofNullable(mapper.findById(id)).map(MyBatisLearningTaskRecord::toDomain);
    }

    @Override
    public List<LearningTask> findAll() {
        log.debug("Finding all learning task records");
        return mapper.findAll().stream()
                .map(MyBatisLearningTaskRecord::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Long id) {
        mapper.deleteById(id);
        log.debug("Deleted learning task record id={}", id);
    }
}
