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
                      bloqueado BOOLEAN DEFAULT FALSE,
                      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
            addColumnIfMissing(con, "usuarios", "rol", "rol ENUM('USER','ADMIN') DEFAULT 'USER'");
            addColumnIfMissing(con, "usuarios", "bloqueado", "bloqueado BOOLEAN DEFAULT FALSE");
            addColumnIfMissing(con, "usuarios", "creado_en", "creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

            st.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS ayuda (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      usuario_id INT,
                      nombre VARCHAR(100) NOT NULL,
                      email VARCHAR(100) NOT NULL,
                      telefono VARCHAR(30),
                      motivo VARCHAR(100) NOT NULL,
                      mensaje TEXT NOT NULL,
                      estado ENUM('Nuevo','En revision','Resuelto') DEFAULT 'Nuevo',
                      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                    )
                    """);

            st.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS resenas (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      usuario_id INT,
                      nombre VARCHAR(100) NOT NULL,
                      actividad VARCHAR(50) NOT NULL,
                      valoracion INT NOT NULL,
                      comentario TEXT NOT NULL,
                      creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                    )
                    """);

            st.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS usuarios_bloqueados (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      email VARCHAR(100) UNIQUE NOT NULL,
                      motivo VARCHAR(255),
                      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);

            st.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS reservas (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      usuario_id INT,
                      nombre_cliente VARCHAR(100) NOT NULL,
                      email_cliente VARCHAR(100) NOT NULL,
                      telefono VARCHAR(30),
                      actividad VARCHAR(50) NOT NULL,
                      instalacion VARCHAR(100) NOT NULL,
                      fecha DATE NOT NULL,
                      hora TIME NOT NULL,
                      personas INT NOT NULL,
                      precio DECIMAL(10,2) NOT NULL,
                      estado ENUM('Confirmada','Cancelada') DEFAULT 'Confirmada',
                      estado_pago ENUM('Pendiente','Pagado') DEFAULT 'Pendiente',
                      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                    )
                    """);

            st.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS usuarios_advertencias (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      email VARCHAR(100) NOT NULL,
                      motivo VARCHAR(255),
                      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);

            st.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS app_estado (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      clave VARCHAR(120) NOT NULL,
                      usuario_email VARCHAR(100) NOT NULL DEFAULT '',
                      valor LONGTEXT NOT NULL,
                      actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      UNIQUE KEY uq_app_estado (clave, usuario_email)
                    )
                    """);

            st.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS app_media (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      nombre VARCHAR(255) NOT NULL,
                      content_type VARCHAR(120) NOT NULL,
                      datos LONGBLOB NOT NULL,
                      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
        }

        asegurarAdmin(con);
    }

    private static void addColumnIfMissing(Connection con, String table, String column, String definition) throws Exception {
        DatabaseMetaData meta = con.getMetaData();
        try (ResultSet rs = meta.getColumns(con.getCatalog(), null, table, column)) {
            if (rs.next()) {
                return;
            }
        }

        try (Statement st = con.createStatement()) {
            st.executeUpdate("ALTER TABLE " + table + " ADD COLUMN " + definition);
        }
    }

    private static void asegurarAdmin(Connection con) throws Exception {
        try (PreparedStatement ps = con.prepareStatement("""
                INSERT INTO usuarios (nombre, apellido, email, password, rol)
                VALUES ('Admin', 'moran', 'admin@test.com', '1234', 'ADMIN')
                ON DUPLICATE KEY UPDATE password = '1234', rol = 'ADMIN'
                """)) {
            ps.executeUpdate();
        }
    }
}
