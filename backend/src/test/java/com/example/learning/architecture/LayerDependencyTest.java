package com.example.learning.architecture;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class LayerDependencyTest {

    private static final Path SOURCE_ROOT = Path.of("src/main/java/com/example/learning");

    @Test
    void domainDoesNotDependOnOuterLayers() throws IOException {
        assertNoImportsFrom("domain", List.of(
                "com.example.learning.application.",
                "com.example.learning.infrastructure.",
                "com.example.learning.interfaces."
        ));
    }

    @Test
    void applicationDoesNotDependOnAdapters() throws IOException {
        assertNoImportsFrom("application", List.of(
                "com.example.learning.infrastructure.",
                "com.example.learning.interfaces."
        ));
    }

    @Test
    void restInterfaceDoesNotDependOnInfrastructureAdapters() throws IOException {
        assertNoImportsFrom("interfaces", List.of("com.example.learning.infrastructure."));
    }

    private void assertNoImportsFrom(String layer, List<String> forbiddenImports) throws IOException {
        List<String> violations;
        try (Stream<Path> files = Files.walk(SOURCE_ROOT.resolve(layer))) {
            violations = files
                    .filter(path -> path.toString().endsWith(".java"))
                    .flatMap(path -> forbiddenImports.stream()
                            .filter(forbiddenImport -> importsPackage(path, forbiddenImport))
                            .map(forbiddenImport -> SOURCE_ROOT.relativize(path) + " imports " + forbiddenImport))
                    .toList();
        }

        assertThat(violations).isEmpty();
    }

    private boolean importsPackage(Path path, String packageName) {
        try {
            return Files.readAllLines(path).stream()
                    .map(String::trim)
                    .anyMatch(line -> line.startsWith("import " + packageName));
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read " + path, ex);
        }
    }
}
