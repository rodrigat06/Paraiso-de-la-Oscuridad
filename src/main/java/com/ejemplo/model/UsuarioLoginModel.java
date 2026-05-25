package com.ejemplo.model;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class UsuarioLoginModel {

    public int validar(String email, String password) throws Exception {
        SchemaModel.asegurarSchema();

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "SELECT id FROM usuarios WHERE email = ? AND password = ?"
             )) {

            ps.setString(1, email);
            ps.setString(2, password);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt("id") : -1;
            }
        }
    }
}
