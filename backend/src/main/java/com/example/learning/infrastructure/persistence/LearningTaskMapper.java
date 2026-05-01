package com.example.learning.infrastructure.persistence;

import com.example.learning.domain.model.TaskStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface LearningTaskMapper {

    int insert(MyBatisLearningTaskRecord record);

    int update(MyBatisLearningTaskRecord record);

    MyBatisLearningTaskRecord findById(Long id);

    List<MyBatisLearningTaskRecord> findAll(@Param("status") TaskStatus status,
                                            @Param("projectId") Long projectId,
                                            @Param("keyword") String keyword,
                                            @Param("overdueOnly") boolean overdueOnly,
                                            @Param("tag") String tag);

    int deleteById(Long id);
}
