package com.example.learning.infrastructure.external;

import com.example.learning.application.port.TaskCodeGenerator;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class LocalTaskCodeGenerator implements TaskCodeGenerator {

    private final AtomicLong sequence = new AtomicLong(1);

    @Override
    public String nextTaskCode() {
        return "TASK-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-" + String.format("%04d", sequence.getAndIncrement());
    }
}
