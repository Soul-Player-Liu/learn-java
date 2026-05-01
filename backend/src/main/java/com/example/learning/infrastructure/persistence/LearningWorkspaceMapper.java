package com.example.learning.infrastructure.persistence;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface LearningWorkspaceMapper {

    int insertProject(LearningProjectRecord record);

    LearningProjectRecord findProjectById(Long id);

    List<LearningProjectRecord> findAllProjects();

    String findProjectNameById(Long id);

    int insertComment(TaskCommentRecord record);

    List<TaskCommentRecord> findCommentsByTaskId(Long taskId);

    int insertActivity(TaskActivityRecord record);

    List<TaskActivityRecord> findActivitiesByTaskId(Long taskId);

    LearningTagRecord findTagByName(String name);

    int insertTag(LearningTagRecord record);

    List<LearningTagRecord> findAllTags();

    List<String> findTagNamesByTaskId(Long taskId);

    int deleteTaskTags(Long taskId);

    int insertTaskTag(@Param("taskId") Long taskId, @Param("tagId") Long tagId);
}
