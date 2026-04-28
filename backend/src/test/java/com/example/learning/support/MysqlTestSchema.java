package com.example.learning.support;

import org.springframework.test.context.DynamicPropertyRegistry;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Locale;
import java.util.UUID;

public final class MysqlTestSchema {

    private static final String JDBC_OPTIONS = "?useUnicode=true&characterEncoding=utf8"
            + "&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false";

    private final String schemaName;
    private final String host;
    private final String port;
    private final String adminUsername;
    private final String adminPassword;
    private final String appUsername;
    private final String appPassword;
    private boolean created;
    private boolean dropped;

    private static final class SharedSchemaHolder {
        private static final MysqlTestSchema INSTANCE = create(sharedNameHint());
    }

    private MysqlTestSchema(String schemaName) {
        this.schemaName = schemaName;
        this.host = value("TEST_MYSQL_HOST", "test.mysql.host", "localhost");
        this.port = value("TEST_MYSQL_PORT", "test.mysql.port", "3306");
        this.adminUsername = value("TEST_MYSQL_ADMIN_USERNAME", "test.mysql.admin-username", "root");
        this.adminPassword = value("TEST_MYSQL_ADMIN_PASSWORD", "test.mysql.admin-password", "root123456");
        this.appUsername = value("TEST_MYSQL_APP_USERNAME", "test.mysql.app-username", "learn");
        this.appPassword = value("TEST_MYSQL_APP_PASSWORD", "test.mysql.app-password", "learn123456");
    }

    public static MysqlTestSchema shared() {
        return SharedSchemaHolder.INSTANCE;
    }

    public static MysqlTestSchema create(String nameHint) {
        String normalizedHint = nameHint.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "_");
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        MysqlTestSchema schema = new MysqlTestSchema("learn_java_it_" + normalizedHint + "_" + suffix);
        Runtime.getRuntime().addShutdownHook(new Thread(schema::drop));
        return schema;
    }

    public synchronized void register(DynamicPropertyRegistry registry) {
        createSchema();
        registry.add("spring.datasource.url", this::appJdbcUrl);
        registry.add("spring.datasource.username", () -> appUsername);
        registry.add("spring.datasource.password", () -> appPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.locations", () -> "classpath:db/migration");
    }

    public synchronized void drop() {
        if (!created || dropped) {
            return;
        }
        try (Connection connection = DriverManager.getConnection(adminJdbcUrl(), adminUsername, adminPassword);
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("drop database if exists `" + schemaName + "`");
            dropped = true;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to drop MySQL test schema " + schemaName, ex);
        }
    }

    private synchronized void createSchema() {
        if (created) {
            return;
        }
        try (Connection connection = DriverManager.getConnection(adminJdbcUrl(), adminUsername, adminPassword);
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("create database `" + schemaName + "` character set utf8mb4 collate utf8mb4_0900_ai_ci");
            statement.executeUpdate("grant all privileges on `" + schemaName + "`.* to '" + appUsername + "'@'%'");
            created = true;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to create MySQL test schema " + schemaName, ex);
        }
    }

    private String adminJdbcUrl() {
        return "jdbc:mysql://" + host + ":" + port + "/" + JDBC_OPTIONS;
    }

    private String appJdbcUrl() {
        return "jdbc:mysql://" + host + ":" + port + "/" + schemaName + JDBC_OPTIONS;
    }

    private static String value(String envName, String propertyName, String defaultValue) {
        String propertyValue = System.getProperty(propertyName);
        if (propertyValue != null && !propertyValue.isBlank()) {
            return propertyValue;
        }
        String envValue = System.getenv(envName);
        if (envValue != null && !envValue.isBlank()) {
            return envValue;
        }
        return defaultValue;
    }

    private static String sharedNameHint() {
        String configuredHint = value("TEST_MYSQL_SCHEMA_HINT", "test.mysql.schema-hint", null);
        if (configuredHint != null && !configuredHint.isBlank()) {
            return configuredHint;
        }
        return "worker_" + ProcessHandle.current().pid();
    }
}
