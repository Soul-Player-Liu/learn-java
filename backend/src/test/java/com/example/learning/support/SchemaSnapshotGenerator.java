package com.example.learning.support;

import com.mysql.cj.jdbc.AbandonedConnectionCleanupThread;
import org.flywaydb.core.Flyway;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

public final class SchemaSnapshotGenerator {

    private static final String JDBC_OPTIONS = "?useUnicode=true&characterEncoding=utf8"
            + "&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false";

    private SchemaSnapshotGenerator() {
    }

    public static void main(String[] args) {
        Config config = Config.from(args);
        String schemaName = "learn_java_schema_snapshot_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        try {
            createSchema(config, schemaName);
            migrate(config, schemaName);
            writeSnapshot(config, schemaName);
        } finally {
            dropSchema(config, schemaName);
            AbandonedConnectionCleanupThread.checkedShutdown();
        }
    }

    private static void createSchema(Config config, String schemaName) {
        try (Connection connection = DriverManager.getConnection(config.adminJdbcUrl(), config.adminUsername, config.adminPassword);
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("create database `" + schemaName + "` character set utf8mb4 collate utf8mb4_0900_ai_ci");
            statement.executeUpdate("grant all privileges on `" + schemaName + "`.* to '" + config.appUsername + "'@'%'");
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to create schema snapshot database " + schemaName, ex);
        }
    }

    private static void migrate(Config config, String schemaName) {
        Flyway.configure()
                .dataSource(config.appJdbcUrl(schemaName), config.appUsername, config.appPassword)
                .locations("classpath:db/migration")
                .load()
                .migrate();
    }

    private static void writeSnapshot(Config config, String schemaName) {
        List<String> tableNames = tableNames(config, schemaName);
        StringBuilder ddl = new StringBuilder();
        ddl.append("-- Auto-generated from Flyway migrations. Do not edit manually.\n");
        ddl.append("-- Regenerate with: ./scripts/generate-schema.sh\n");
        ddl.append("-- Source: backend/src/main/resources/db/migration/*.sql\n\n");

        for (int index = 0; index < tableNames.size(); index++) {
            if (index > 0) {
                ddl.append("\n\n");
            }
            ddl.append(showCreateTable(config, schemaName, tableNames.get(index))).append(";");
        }
        ddl.append("\n");

        try {
            Files.createDirectories(config.output.getParent());
            Files.writeString(config.output, ddl.toString(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to write schema snapshot " + config.output, ex);
        }
    }

    private static List<String> tableNames(Config config, String schemaName) {
        String sql = """
                select table_name
                from information_schema.tables
                where table_schema = '%s'
                  and table_type = 'BASE TABLE'
                  and table_name <> 'flyway_schema_history'
                order by table_name
                """.formatted(schemaName);

        try (Connection connection = DriverManager.getConnection(config.appJdbcUrl(schemaName), config.appUsername, config.appPassword);
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(sql)) {
            List<String> names = new ArrayList<>();
            while (resultSet.next()) {
                names.add(resultSet.getString("table_name"));
            }
            return names;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to query table names from schema snapshot database " + schemaName, ex);
        }
    }

    private static String showCreateTable(Config config, String schemaName, String tableName) {
        try (Connection connection = DriverManager.getConnection(config.appJdbcUrl(schemaName), config.appUsername, config.appPassword);
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery("show create table `" + tableName + "`")) {
            if (!resultSet.next()) {
                throw new IllegalStateException("SHOW CREATE TABLE returned no rows for " + tableName);
            }
            return resultSet.getString(2);
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to export DDL for table " + tableName, ex);
        }
    }

    private static void dropSchema(Config config, String schemaName) {
        try (Connection connection = DriverManager.getConnection(config.adminJdbcUrl(), config.adminUsername, config.adminPassword);
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("drop database if exists `" + schemaName + "`");
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to drop schema snapshot database " + schemaName, ex);
        }
    }

    private record Config(
            String host,
            String port,
            String adminUsername,
            String adminPassword,
            String appUsername,
            String appPassword,
            Path output
    ) {

        static Config from(String[] args) {
            return new Config(
                    value("TEST_MYSQL_HOST", "localhost"),
                    value("TEST_MYSQL_PORT", "3306"),
                    value("TEST_MYSQL_ADMIN_USERNAME", "root"),
                    value("TEST_MYSQL_ADMIN_PASSWORD", "root123456"),
                    value("TEST_MYSQL_APP_USERNAME", "learn"),
                    value("TEST_MYSQL_APP_PASSWORD", "learn123456"),
                    output(args)
            );
        }

        String adminJdbcUrl() {
            return "jdbc:mysql://" + host + ":" + port + "/" + JDBC_OPTIONS;
        }

        String appJdbcUrl(String schemaName) {
            return "jdbc:mysql://" + host + ":" + port + "/" + schemaName + JDBC_OPTIONS;
        }

        private static Path output(String[] args) {
            for (String arg : args) {
                if (arg.startsWith("--output=")) {
                    return Path.of(arg.substring("--output=".length()));
                }
            }
            return Path.of("../docs/schema/current.sql");
        }

        private static String value(String envName, String defaultValue) {
            String envValue = System.getenv(envName);
            if (envValue != null && !envValue.isBlank()) {
                return envValue;
            }
            String propertyValue = System.getProperty(envName.toLowerCase(Locale.ROOT).replace('_', '.'));
            if (propertyValue != null && !propertyValue.isBlank()) {
                return propertyValue;
            }
            return defaultValue;
        }
    }
}
