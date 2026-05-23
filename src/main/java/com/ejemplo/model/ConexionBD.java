package com.ejemplo.model;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ConexionBD {

    private static final String MYSQL_URL = env("MYSQL_URL", "");
    private static final String DB_HOST = env("DB_HOST", env("MYSQLHOST", "mysql"));
    private static final String DB_PORT = env("DB_PORT", env("MYSQLPORT", "3306"));
    private static final String DB_NAME = env("DB_NAME", env("MYSQLDATABASE", "bd1"));
    private static final String DB_USER = env("DB_USER", env("MYSQLUSER", mysqlUrlGroup(1, "root")));
    private static final String DB_PASSWORD = env("DB_PASSWORD", env("MYSQLPASSWORD", mysqlUrlGroup(2, "root")));

    private static final String URL = jdbcUrl();

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("No se pudo cargar el driver de MySQL", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, DB_USER, DB_PASSWORD);
    }

    private static String jdbcUrl() {
        if (!MYSQL_URL.isBlank()) {
            Matcher matcher = Pattern.compile("^mysql://(?:[^:@/]+(?::[^@/]*)?@)?([^:/]+)(?::(\\d+))?/([^?]+).*$").matcher(MYSQL_URL);
            if (matcher.matches()) {
                String host = matcher.group(1);
                String port = matcher.group(2) == null ? "3306" : matcher.group(2);
                String database = matcher.group(3);
                return baseUrl(host, port, database);
            }
        }

        return baseUrl(DB_HOST, DB_PORT, DB_NAME);
    }

    private static String baseUrl(String host, String port, String database) {
        return "jdbc:mysql://" + host + ":" + port + "/" + database
                + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String mysqlUrlGroup(int group, String fallback) {
        if (MYSQL_URL.isBlank()) {
            return fallback;
        }

        Matcher matcher = Pattern.compile("^mysql://([^:@/]+)(?::([^@/]*))?@.*$").matcher(MYSQL_URL);
        if (!matcher.matches()) {
            return fallback;
        }

        String value = matcher.group(group);
        if (value == null || value.isBlank()) {
            return fallback;
        }

        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
