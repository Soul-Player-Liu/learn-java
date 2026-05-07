package com.example.learning.infrastructure.external;

import com.example.learning.application.port.UserDirectoryClient;
import com.example.learning.application.port.UserProfile;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Component
public class InMemoryUserDirectoryClient implements UserDirectoryClient {

    private final Map<String, UserProfile> users = Map.of(
            "pm", new UserProfile("pm", "pm", "product"),
            "alex", new UserProfile("Alex", "Alex", "engineering"),
            "integration-test", new UserProfile("integration-test", "integration-test", "quality")
    );

    @Override
    public Optional<UserProfile> findByUsername(String username) {
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }
        UserProfile knownUser = users.get(username.toLowerCase(Locale.ROOT));
        if (knownUser != null) {
            return Optional.of(knownUser);
        }
        return Optional.of(new UserProfile(username, username, "local"));
    }
}
