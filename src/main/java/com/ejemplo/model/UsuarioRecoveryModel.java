package com.ejemplo.model;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class UsuarioRecoveryModel {

    public String obtenerNombrePorEmail(String email) throws Exception {
        String cleanEmail = normalizarEmail(email);
        if (cleanEmail.isBlank()) {
            return null;
        }

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "SELECT nombre FROM usuarios WHERE LOWER(email) = LOWER(?) LIMIT 1")) {

            ps.setString(1, cleanEmail);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("nombre");
                }
            }
        }

        return null;
    }

    public boolean cambiarPassword(String email, String password) throws Exception {
        String cleanEmail = normalizarEmail(email);
        String cleanPassword = password == null ? "" : password.trim();

        if (cleanEmail.isBlank() || cleanPassword.length() < 6) {
            return false;
        }

        if (BloqueoUsuarioModel.estaBloqueado(cleanEmail)) {
            return false;
        }

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "UPDATE usuarios SET password = ? WHERE LOWER(email) = LOWER(?)")) {

            ps.setString(1, cleanPassword);
            ps.setString(2, cleanEmail);
            return ps.executeUpdate() > 0;
        }
    }

    private String normalizarEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
