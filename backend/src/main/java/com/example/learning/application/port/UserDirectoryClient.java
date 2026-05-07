package com.example.learning.application.port;

import java.util.Optional;

public interface UserDirectoryClient {

    Optional<UserProfile> findByUsername(String username);
}
