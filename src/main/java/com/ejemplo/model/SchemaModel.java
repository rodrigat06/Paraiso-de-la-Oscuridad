package com.ejemplo.model;

import java.sql.Connection;
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
                      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
        }
    }
}
