package com.example.learning.infrastructure.persistence;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface LearningTaskMapper {

    int insert(MyBatisLearningTaskRecord record);

    int update(MyBatisLearningTaskRecord record);

    MyBatisLearningTaskRecord findById(Long id);

    List<MyBatisLearningTaskRecord> findAll();

    int deleteById(Long id);
}
