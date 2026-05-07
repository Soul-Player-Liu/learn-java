package com.example.learning.infrastructure.external;

import com.example.learning.application.port.TaskRiskClient;
import com.example.learning.application.port.TaskRiskDecision;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class LocalTaskRiskClient implements TaskRiskClient {

    @Override
    public TaskRiskDecision reviewTaskCreation(String title, LocalDate dueDate) {
        return TaskRiskDecision.approved();
    }
}
