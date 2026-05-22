package com.ejemplo.model;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.LinkedHashMap;
import java.util.Map;

public class AppStateModel {

    public Map<String, String> listar(String usuarioEmail) throws Exception {
        asegurarTabla();
        Map<String, String> datos = new LinkedHashMap<>();
        String email = normalizar(usuarioEmail);

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "SELECT clave, usuario_email, valor FROM app_estado WHERE usuario_email = '' OR usuario_email = ? ORDER BY usuario_email, clave"
             )) {
            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String scope = rs.getString("usuario_email");
                    String clave = rs.getString("clave");
                    String llave = scope == null || scope.isBlank() ? clave : clave + "::user";
                    datos.put(llave, rs.getString("valor"));
                }
            }
        }

        return datos;
    }

    public boolean guardar(String clave, String usuarioEmail, String valor, boolean global) throws Exception {
        asegurarTabla();
        String email = global ? "" : normalizar(usuarioEmail);

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "INSERT INTO app_estado (clave, usuario_email, valor) VALUES (?, ?, ?) " +
                             "ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado_en = CURRENT_TIMESTAMP"
             )) {
            ps.setString(1, clave);
            ps.setString(2, email);
            ps.setString(3, valor == null ? "" : valor);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean eliminar(String clave, String usuarioEmail, boolean global) throws Exception {
        asegurarTabla();
        String email = global ? "" : normalizar(usuarioEmail);

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement("DELETE FROM app_estado WHERE clave = ? AND usuario_email = ?")) {
            ps.setString(1, clave);
            ps.setString(2, email);
            return ps.executeUpdate() > 0;
        }
    }

    private String normalizar(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private void asegurarTabla() throws Exception {
        String sql = "CREATE TABLE IF NOT EXISTS app_estado ("
                + "id INT AUTO_INCREMENT PRIMARY KEY,"
                + "clave VARCHAR(120) NOT NULL,"
                + "usuario_email VARCHAR(100) NOT NULL DEFAULT '',"
                + "valor LONGTEXT NOT NULL,"
                + "actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "UNIQUE KEY uq_app_estado (clave, usuario_email)"
                + ")";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.executeUpdate();
        }
    }
}
