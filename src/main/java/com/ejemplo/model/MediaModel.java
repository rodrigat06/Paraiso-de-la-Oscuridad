package com.ejemplo.model;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class MediaModel {

    public int guardar(String nombre, String contentType, InputStream datos) throws Exception {
        asegurarTabla();

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "INSERT INTO app_media (nombre, content_type, datos) VALUES (?, ?, ?)",
                     PreparedStatement.RETURN_GENERATED_KEYS
             )) {
            ps.setString(1, nombre == null || nombre.isBlank() ? "archivo" : nombre);
            ps.setString(2, contentType == null || contentType.isBlank() ? "application/octet-stream" : contentType);
            ps.setBlob(3, datos);
            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }

        throw new IllegalStateException("No se pudo guardar el archivo.");
    }

    public Archivo obtener(int id) throws Exception {
        asegurarTabla();

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT nombre, content_type, datos FROM app_media WHERE id = ?")) {
            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                return new Archivo(
                        rs.getString("nombre"),
                        rs.getString("content_type"),
                        rs.getBytes("datos")
                );
            }
        }
    }

    private void asegurarTabla() throws Exception {
        String sql = "CREATE TABLE IF NOT EXISTS app_media ("
                + "id INT AUTO_INCREMENT PRIMARY KEY,"
                + "nombre VARCHAR(255) NOT NULL,"
                + "content_type VARCHAR(120) NOT NULL,"
                + "datos LONGBLOB NOT NULL,"
                + "creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                + ")";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.executeUpdate();
        }
    }

    public record Archivo(String nombre, String contentType, byte[] datos) {}
}
