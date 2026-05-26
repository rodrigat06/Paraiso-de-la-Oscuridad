package com.ejemplo.model;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public final class SchemaModel {

    private SchemaModel() {
    }

    public static void asegurarSchema() throws Exception {
        try (Connection con = ConexionBD.getConnection()) {
            asegurarSchema(con);
        }
    }

    public static void asegurarSchema(Connection con) throws Exception {
        try (Statement st = con.createStatement()) {
            st.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS usuarios (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      nombre VARCHAR(100) NOT NULL,
                      apellido VARCHAR(100) NOT NULL,
                      email VARCHAR(100) UNIQUE NOT NULL,
                      password VARCHAR(255) NOT NULL,
                      rol ENUM('USER','ADMIN') DEFAULT 'USER',
                      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
            anadirColumnaSiFalta(con, st, "rol", "ALTER TABLE usuarios ADD COLUMN rol ENUM('USER','ADMIN') DEFAULT 'USER'");
            anadirColumnaSiFalta(con, st, "bloqueado", "ALTER TABLE usuarios ADD COLUMN bloqueado BOOLEAN DEFAULT FALSE");
        }

        try (PreparedStatement ps = con.prepareStatement("""
                INSERT INTO usuarios (nombre, apellido, email, password, rol)
                VALUES ('Admin', 'Principal', 'admin@test.com', '1234', 'ADMIN')
                ON DUPLICATE KEY UPDATE rol = 'ADMIN'
                """)) {
            ps.executeUpdate();
        }
    }

    private static void anadirColumnaSiFalta(Connection con, Statement st, String columna, String sql) throws Exception {
        DatabaseMetaData metaData = con.getMetaData();

        try (ResultSet rs = metaData.getColumns(con.getCatalog(), null, "usuarios", columna)) {
            if (!rs.next()) {
                st.executeUpdate(sql);
            }
        }
    }
}
