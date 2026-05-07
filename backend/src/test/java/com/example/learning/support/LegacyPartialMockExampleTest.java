package com.example.learning.support;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

class LegacyPartialMockExampleTest {

    @Test
    void spyCanReplaceOnlyTheExternalMethodOnALegacyClass() {
        LegacyTaskImportService service = spy(new LegacyTaskImportService());
        doReturn("profile:mock-user")
                .when(service)
                .loadUserProfileFromExternalSystem(anyString());

        String summary = service.importTask("mock-user", "Learn partial mock");

        assertThat(summary).isEqualTo("Imported Learn partial mock for profile:mock-user");
        verify(service).loadUserProfileFromExternalSystem("mock-user");
    }

    static class LegacyTaskImportService {

        String importTask(String username, String title) {
            String userProfile = loadUserProfileFromExternalSystem(username);
            return "Imported " + title + " for " + userProfile;
        }

        String loadUserProfileFromExternalSystem(String username) {
            throw new IllegalStateException("This legacy method would call an external HTTP API");
        }
    }
}
