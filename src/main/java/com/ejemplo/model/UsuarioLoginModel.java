package com.ejemplo.model;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class UsuarioLoginModel {

    public int validar(String email, String password) {
        try {
            Connection con = ConexionBD.getConnection();

            PreparedStatement ps = con.prepareStatement(
                "SELECT id FROM usuarios WHERE email = ? AND password = ?"
            );

            ps.setString(1, email);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return rs.getInt("id");
            }

            return -1;

        } catch (Exception e) {
            return -1;
        }
    }

    public boolean estaBloqueado(String email) {
        try {
            return BloqueoUsuarioModel.estaBloqueado(email);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public String obtenerRolPorEmail(String email) {
        String rol = "USER";

        try {
            Connection con = ConexionBD.getConnection();

            PreparedStatement ps = con.prepareStatement(
                "SELECT rol FROM usuarios WHERE email = ?"
            );

            ps.setString(1, email);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                rol = rs.getString("rol");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return rol;
    }
}
