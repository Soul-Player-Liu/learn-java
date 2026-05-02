package com.example.learning.application.port;

import com.example.learning.application.query.ListLearningTasksQuery;
import com.example.learning.application.dto.TaskListItemDto;

import java.util.List;

public interface LearningTaskQueryRepository {

    long count(ListLearningTasksQuery query);

    List<TaskListItemDto> findPage(ListLearningTasksQuery query);
}
