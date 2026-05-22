package com.ejemplo.model;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLSyntaxErrorException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class BloqueoUsuarioModel {

    public static boolean bloquear(String email, String motivo) throws Exception {
        String cleanEmail = normalizarEmail(email);
        if (cleanEmail.isBlank()) {
            return false;
        }

        try (Connection con = ConexionBD.getConnection()) {
            asegurarSchema(con);

            try (PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO usuarios_bloqueados (email, motivo) VALUES (?, ?) " +
                    "ON DUPLICATE KEY UPDATE motivo = VALUES(motivo), creado_en = CURRENT_TIMESTAMP")) {
                ps.setString(1, cleanEmail);
                ps.setString(2, motivo == null || motivo.isBlank() ? "Bloqueado desde el panel de administrador" : motivo);
                ps.executeUpdate();
            }

            actualizarUsuario(con, cleanEmail, true);
            return true;
        }
    }

    public static boolean desbloquear(String email) throws Exception {
        String cleanEmail = normalizarEmail(email);
        if (cleanEmail.isBlank()) {
            return false;
        }

        try (Connection con = ConexionBD.getConnection()) {
            asegurarSchema(con);

            try (PreparedStatement ps = con.prepareStatement("DELETE FROM usuarios_bloqueados WHERE email = ?")) {
                ps.setString(1, cleanEmail);
                ps.executeUpdate();
            }

            actualizarUsuario(con, cleanEmail, false);
            return true;
        }
    }

    public static boolean estaBloqueado(String email) throws Exception {
        String cleanEmail = normalizarEmail(email);
        if (cleanEmail.isBlank()) {
            return false;
        }

        try (Connection con = ConexionBD.getConnection()) {
            asegurarSchema(con);

            try (PreparedStatement ps = con.prepareStatement(
                    "SELECT 1 FROM usuarios_bloqueados WHERE email = ? " +
                    "UNION SELECT 1 FROM usuarios WHERE email = ? AND bloqueado = TRUE LIMIT 1")) {
                ps.setString(1, cleanEmail);
                ps.setString(2, cleanEmail);

                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next();
                }
            }
        }
    }

    public static List<Map<String, Object>> listar() throws Exception {
        try (Connection con = ConexionBD.getConnection()) {
            asegurarSchema(con);

            try (PreparedStatement ps = con.prepareStatement(
                    "SELECT email, motivo, creado_en FROM usuarios_bloqueados ORDER BY creado_en DESC");
                 ResultSet rs = ps.executeQuery()) {
                List<Map<String, Object>> usuarios = new ArrayList<>();

                while (rs.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("email", rs.getString("email"));
                    item.put("motivo", rs.getString("motivo"));
                    item.put("creado_en", rs.getString("creado_en"));
                    item.put("createdAt", rs.getString("creado_en"));
                    usuarios.add(item);
                }

                return usuarios;
            }
        }
    }

    private static void asegurarSchema(Connection con) throws Exception {
        try (PreparedStatement ps = con.prepareStatement(
                "CREATE TABLE IF NOT EXISTS usuarios_bloqueados (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "email VARCHAR(100) UNIQUE NOT NULL, " +
                "motivo VARCHAR(255), " +
                "creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")) {
            ps.executeUpdate();
        }

        try (PreparedStatement ps = con.prepareStatement(
                "ALTER TABLE usuarios ADD COLUMN bloqueado BOOLEAN DEFAULT FALSE")) {
            ps.executeUpdate();
        } catch (SQLSyntaxErrorException e) {
            if (!e.getMessage().toLowerCase().contains("duplicate column")) {
                throw e;
            }
        }
    }

    private static void actualizarUsuario(Connection con, String email, boolean bloqueado) throws Exception {
        try (PreparedStatement ps = con.prepareStatement("UPDATE usuarios SET bloqueado = ? WHERE email = ?")) {
            ps.setBoolean(1, bloqueado);
            ps.setString(2, email);
            ps.executeUpdate();
        }
    }

    private static String normalizarEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
