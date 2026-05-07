package com.example.learning.application.port;

public record TaskRiskDecision(boolean allowed, String reason) {

    public static TaskRiskDecision approved() {
        return new TaskRiskDecision(true, null);
    }

    public static TaskRiskDecision rejected(String reason) {
        return new TaskRiskDecision(false, reason);
    }

    public boolean rejected() {
        return !allowed;
    }
}
