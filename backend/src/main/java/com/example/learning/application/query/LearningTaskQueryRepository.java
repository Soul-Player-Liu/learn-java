package com.example.learning.application.query;

import com.example.learning.application.command.ListLearningTasksQuery;
import com.example.learning.application.dto.TaskListItemDto;

import java.util.List;

public interface LearningTaskQueryRepository {

    long count(ListLearningTasksQuery query);

    List<TaskListItemDto> findPage(ListLearningTasksQuery query);
}
