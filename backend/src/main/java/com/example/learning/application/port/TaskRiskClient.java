package com.example.learning.application.port;

import java.time.LocalDate;

public interface TaskRiskClient {

    TaskRiskDecision reviewTaskCreation(String title, LocalDate dueDate);
}
