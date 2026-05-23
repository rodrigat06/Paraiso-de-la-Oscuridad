package com.ejemplo.model;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AdminModel {

    public List<Map<String, Object>> listarReservas() throws Exception {
        asegurarSchema();
        String sql = "SELECT id, usuario_id, nombre_cliente, email_cliente, telefono, actividad, instalacion, fecha, hora, personas, precio, estado, estado_pago, creado_en FROM reservas ORDER BY fecha DESC, hora DESC, id DESC";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Map<String, Object>> reservas = new ArrayList<>();

            while (rs.next()) {
                Map<String, Object> reserva = new LinkedHashMap<>();
                reserva.put("id", rs.getInt("id"));
                reserva.put("usuarioId", rs.getObject("usuario_id"));
                reserva.put("client", rs.getString("nombre_cliente"));
                reserva.put("email", rs.getString("email_cliente"));
                reserva.put("phone", rs.getString("telefono"));
                reserva.put("sport", rs.getString("actividad"));
                reserva.put("resource", rs.getString("instalacion"));
                Date fecha = rs.getDate("fecha");
                Time hora = rs.getTime("hora");
                Timestamp creado = rs.getTimestamp("creado_en");
                reserva.put("date", fecha != null ? fecha.toString() : null);
                reserva.put("time", hora != null ? hora.toString().substring(0, 5) : null);
                reserva.put("people", rs.getInt("personas"));
                reserva.put("price", rs.getBigDecimal("precio"));
                reserva.put("status", rs.getString("estado"));
                reserva.put("paymentStatus", rs.getString("estado_pago"));
                reserva.put("createdAt", creado != null ? creado.toString() : null);
                reservas.add(reserva);
            }

            return reservas;
        }
    }

    public Map<String, Object> crearReserva(Map<String, Object> data) throws Exception {
        asegurarSchema();
        String email = stringValue(data, "email").toLowerCase();
        if (estaBloqueado(email)) {
            throw new IllegalStateException("Cuenta bloqueada");
        }

        String sql = "INSERT INTO reservas (usuario_id, nombre_cliente, email_cliente, telefono, actividad, instalacion, fecha, hora, personas, precio, estado, estado_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmada', 'Pendiente')";
        Integer usuarioId = buscarUsuarioIdPorEmail(email);

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            if (usuarioId == null) {
                ps.setNull(1, java.sql.Types.INTEGER);
            } else {
                ps.setInt(1, usuarioId);
            }
            ps.setString(2, stringValue(data, "client"));
            ps.setString(3, email);
            ps.setString(4, stringValue(data, "phone"));
            ps.setString(5, stringValue(data, "sport"));
            ps.setString(6, stringValue(data, "resource"));
            ps.setDate(7, Date.valueOf(stringValue(data, "date")));
            ps.setTime(8, Time.valueOf(stringValue(data, "time") + ":00"));
            ps.setInt(9, intValue(data, "people"));
            ps.setBigDecimal(10, decimalValue(data, "price"));
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    Map<String, Object> result = new LinkedHashMap<>();
                    result.put("id", keys.getInt(1));
                    return result;
                }
            }
        }

        return Map.of("id", null);
    }

    public boolean actualizarPago(int idReserva, String estadoPago) throws Exception {
        asegurarSchema();
        String sql = "UPDATE reservas SET estado_pago = ? WHERE id = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, estadoPago);
            ps.setInt(2, idReserva);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean cancelarReserva(int idReserva) throws Exception {
        asegurarSchema();
        String sql = "UPDATE reservas SET estado = 'Cancelada' WHERE id = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idReserva);
            return ps.executeUpdate() > 0;
        }
    }

    public List<Map<String, Object>> listarAyuda() throws Exception {
        asegurarSchema();
        String sql = "SELECT id, usuario_id, nombre, email, telefono, motivo, mensaje, estado, creado_en FROM ayuda ORDER BY creado_en DESC, id DESC";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Map<String, Object>> solicitudes = new ArrayList<>();

            while (rs.next()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", rs.getInt("id"));
                item.put("usuarioId", rs.getObject("usuario_id"));
                item.put("name", rs.getString("nombre"));
                item.put("email", rs.getString("email"));
                item.put("phone", rs.getString("telefono"));
                item.put("topic", rs.getString("motivo"));
                item.put("message", rs.getString("mensaje"));
                item.put("status", rs.getString("estado"));
                Timestamp creado = rs.getTimestamp("creado_en");
                item.put("createdAt", creado != null ? creado.toString() : null);
                solicitudes.add(item);
            }

            return solicitudes;
        }
    }

    public boolean crearAyuda(Map<String, Object> data) throws Exception {
        asegurarSchema();
        String email = stringValue(data, "email").toLowerCase();
        if (estaBloqueado(email)) {
            throw new IllegalStateException("Cuenta bloqueada");
        }

        String sql = "INSERT INTO ayuda (usuario_id, nombre, email, telefono, motivo, mensaje, estado) VALUES (?, ?, ?, ?, ?, ?, 'Nuevo')";
        Integer usuarioId = buscarUsuarioIdPorEmail(email);

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            if (usuarioId == null) {
                ps.setNull(1, java.sql.Types.INTEGER);
            } else {
                ps.setInt(1, usuarioId);
            }
            ps.setString(2, stringValue(data, "name"));
            ps.setString(3, email);
            ps.setString(4, stringValue(data, "phone"));
            ps.setString(5, stringValue(data, "topic"));
            ps.setString(6, stringValue(data, "message"));
            return ps.executeUpdate() > 0;
        }
    }

    public boolean eliminarAyuda(int id) throws Exception {
        asegurarSchema();
        return eliminarPorId("ayuda", id);
    }

    public List<Map<String, Object>> listarResenas() throws Exception {
        asegurarSchema();
        String sql = "SELECT id, usuario_id, nombre, actividad, valoracion, comentario, creada_en FROM resenas ORDER BY creada_en DESC, id DESC";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Map<String, Object>> resenas = new ArrayList<>();

            while (rs.next()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", rs.getInt("id"));
                item.put("usuarioId", rs.getObject("usuario_id"));
                item.put("name", rs.getString("nombre"));
                item.put("sport", rs.getString("actividad"));
                item.put("rating", rs.getInt("valoracion"));
                item.put("comment", rs.getString("comentario"));
                Timestamp creado = rs.getTimestamp("creada_en");
                item.put("createdAt", creado != null ? creado.toString() : null);
                resenas.add(item);
            }

            return resenas;
        }
    }

    public boolean crearResena(Map<String, Object> data) throws Exception {
        asegurarSchema();
        String email = stringValue(data, "email").toLowerCase();
        if (!email.isBlank() && estaBloqueado(email)) {
            throw new IllegalStateException("Cuenta bloqueada");
        }

        String sql = "INSERT INTO resenas (usuario_id, nombre, actividad, valoracion, comentario) VALUES (?, ?, ?, ?, ?)";
        Integer usuarioId = email.isBlank() ? null : buscarUsuarioIdPorEmail(email);

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            if (usuarioId == null) {
                ps.setNull(1, java.sql.Types.INTEGER);
            } else {
                ps.setInt(1, usuarioId);
            }
            ps.setString(2, stringValue(data, "name"));
            ps.setString(3, stringValue(data, "sport"));
            ps.setInt(4, intValue(data, "rating"));
            ps.setString(5, stringValue(data, "comment"));
            return ps.executeUpdate() > 0;
        }
    }

    public boolean eliminarResena(int id) throws Exception {
        asegurarSchema();
        return eliminarPorId("resenas", id);
    }

    public List<Map<String, Object>> listarUsuarios() throws Exception {
        asegurarSchema();
        String sql = "SELECT id, nombre, apellido, email, rol, bloqueado, creado_en FROM usuarios ORDER BY creado_en DESC, id DESC";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Map<String, Object>> usuarios = new ArrayList<>();

            while (rs.next()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", rs.getInt("id"));
                item.put("nombre", rs.getString("nombre"));
                item.put("apellido", rs.getString("apellido"));
                item.put("email", rs.getString("email"));
                item.put("rol", rs.getString("rol"));
                item.put("bloqueado", rs.getBoolean("bloqueado"));
                Timestamp creado = rs.getTimestamp("creado_en");
                item.put("createdAt", creado != null ? creado.toString() : null);
                usuarios.add(item);
            }

            return usuarios;
        }
    }

    public List<Map<String, Object>> listarAdvertencias() throws Exception {
        asegurarSchema();
        String sql = "SELECT id, email, motivo, creado_en FROM usuarios_advertencias ORDER BY creado_en DESC, id DESC";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Map<String, Object>> advertencias = new ArrayList<>();

            while (rs.next()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", rs.getInt("id"));
                item.put("email", rs.getString("email"));
                item.put("motivo", rs.getString("motivo"));
                Timestamp creado = rs.getTimestamp("creado_en");
                item.put("createdAt", creado != null ? creado.toString() : null);
                advertencias.add(item);
            }

            return advertencias;
        }
    }

    public boolean advertirUsuario(String email, String motivo) throws Exception {
        asegurarSchema();
        String cleanEmail = email == null ? "" : email.trim().toLowerCase();
        if (cleanEmail.isBlank()) {
            return false;
        }

        String sql = "INSERT INTO usuarios_advertencias (email, motivo) VALUES (?, ?)";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, cleanEmail);
            ps.setString(2, motivo == null || motivo.isBlank() ? "Advertencia desde administrador" : motivo);
            return ps.executeUpdate() > 0;
        }
    }

    public List<Map<String, Object>> listarBloqueados() throws Exception {
        return BloqueoUsuarioModel.listar();
    }

    public boolean bloquearEmail(String email, String motivo) throws Exception {
        return BloqueoUsuarioModel.bloquear(email, motivo);
    }

    public boolean desbloquearEmail(String email) throws Exception {
        return BloqueoUsuarioModel.desbloquear(email);
    }

    public boolean estaBloqueado(String email) throws Exception {
        return BloqueoUsuarioModel.estaBloqueado(email);
    }

    private void asegurarSchema() throws Exception {
        SchemaModel.asegurarSchema();
    }

    private boolean eliminarPorId(String tabla, int id) throws Exception {
        String sql = "DELETE FROM " + tabla + " WHERE id = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    private Integer buscarUsuarioIdPorEmail(String email) throws Exception {
        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT id FROM usuarios WHERE email = ?")) {
            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }

        return null;
    }

    private String stringValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value == null ? "" : String.valueOf(value).trim();
    }

    private int intValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }

    private BigDecimal decimalValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return new BigDecimal(String.valueOf(value));
    }
}
