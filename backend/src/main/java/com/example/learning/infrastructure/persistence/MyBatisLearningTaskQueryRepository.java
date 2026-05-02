package com.example.learning.infrastructure.persistence;

import com.example.learning.application.command.ListLearningTasksQuery;
import com.example.learning.application.dto.TaskListItemDto;
import com.example.learning.application.query.LearningTaskQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MyBatisLearningTaskQueryRepository implements LearningTaskQueryRepository {

    private final LearningTaskMapper mapper;

    @Override
    public long count(ListLearningTasksQuery query) {
        return mapper.countAll(query.status(), query.projectId(), query.normalizedKeyword(), query.isOverdueOnly(),
                query.normalizedTag());
    }

    @Override
    public List<TaskListItemDto> findPage(ListLearningTasksQuery query) {
        return mapper.findPageItems(
                        query.status(),
                        query.projectId(),
                        query.normalizedKeyword(),
                        query.isOverdueOnly(),
                        query.normalizedTag(),
                        query.limit(),
                        query.offset()
                ).stream()
                .map(LearningTaskListItemRecord::toDto)
                .toList();
    }
}
