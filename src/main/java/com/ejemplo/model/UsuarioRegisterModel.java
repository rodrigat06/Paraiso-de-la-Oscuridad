package com.ejemplo.model;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class UsuarioRegisterModel {

    public boolean registrar(String nombre, String apellido, String email, String password) {
        try (Connection con = ConexionBD.getConnection()) {
            SchemaModel.asegurarSchema(con);

            try (PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO usuarios (nombre, apellido, email, password) VALUES (?, ?, ?, ?)"
            )) {
                ps.setString(1, nombre);
                ps.setString(2, apellido);
                ps.setString(3, email);
                ps.setString(4, password);

                return ps.executeUpdate() > 0;
            }
        } catch (Exception e) {
            return false;
        }
    }
}
