package com.ejemplo.model;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class UsuarioLoginModel {

    public UsuarioSesion validar(String email, String password) throws Exception {
        SchemaModel.asegurarSchema();

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "SELECT id, email, rol FROM usuarios WHERE LOWER(email) = LOWER(?) AND password = ? AND bloqueado = FALSE"
             )) {

            ps.setString(1, email);
            ps.setString(2, password);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }

                return new UsuarioSesion(
                        rs.getInt("id"),
                        rs.getString("email"),
                        rs.getString("rol")
                );
            }
        }
    }
}
