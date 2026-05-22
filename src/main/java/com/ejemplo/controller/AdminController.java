package com.ejemplo.controller;

import com.ejemplo.model.AdminModel;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/admin/*")
public class AdminController extends HttpServlet {
    private final Gson gson = new Gson();
    private final AdminModel model = new AdminModel();
    private final Type mapType = new TypeToken<Map<String, Object>>() {}.getType();

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        cors(response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        cors(response);
        response.setContentType("application/json;charset=UTF-8");
        if (!isAdmin(request)) {
            forbidden(response);
            return;
        }
        String path = path(request);

        try {
            switch (path) {
                case "/reservas" -> write(response, ok("reservas", model.listarReservas()));
                case "/ayuda" -> write(response, ok("ayuda", model.listarAyuda()));
                case "/resenas" -> write(response, ok("resenas", model.listarResenas()));
                case "/usuarios" -> write(response, ok("usuarios", model.listarUsuarios()));
                case "/advertencias" -> write(response, ok("advertencias", model.listarAdvertencias()));
                case "/bloqueados" -> write(response, ok("bloqueados", model.listarBloqueados()));
                default -> notFound(response);
            }
        } catch (Exception e) {
            error(response, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        cors(response);
        response.setContentType("application/json;charset=UTF-8");
        if (!isAdmin(request)) {
            forbidden(response);
            return;
        }
        String path = path(request);
        Map<String, Object> body = readBody(request);

        try {
            switch (path) {
                case "/reservas/pago" -> {
                    int id = ((Number) body.get("id")).intValue();
                    String estadoPago = String.valueOf(body.get("estadoPago"));
                    write(response, simple(model.actualizarPago(id, estadoPago)));
                }
                case "/ayuda/eliminar" -> {
                    int id = ((Number) body.get("id")).intValue();
                    write(response, simple(model.eliminarAyuda(id)));
                }
                case "/resenas/eliminar" -> {
                    int id = ((Number) body.get("id")).intValue();
                    write(response, simple(model.eliminarResena(id)));
                }
                case "/bloquear" -> {
                    String email = String.valueOf(body.get("email"));
                    String motivo = body.get("motivo") == null ? "" : String.valueOf(body.get("motivo"));
                    write(response, simple(model.bloquearEmail(email, motivo)));
                }
                case "/desbloquear" -> {
                    String email = String.valueOf(body.get("email"));
                    write(response, simple(model.desbloquearEmail(email)));
                }
                case "/advertir" -> {
                    String email = String.valueOf(body.get("email"));
                    String motivo = body.get("motivo") == null ? "" : String.valueOf(body.get("motivo"));
                    write(response, simple(model.advertirUsuario(email, motivo)));
                }
                default -> notFound(response);
            }
        } catch (Exception e) {
            error(response, e);
        }
    }

    private boolean isAdmin(HttpServletRequest request) {
        Object rol = request.getSession(false) == null ? null : request.getSession(false).getAttribute("rol");
        return "ADMIN".equals(String.valueOf(rol));
    }

    private void forbidden(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        write(response, Map.of("ok", false, "mensaje", "Acceso solo para administradores"));
    }

    private String path(HttpServletRequest request) {
        return request.getPathInfo() == null ? "/" : request.getPathInfo();
    }

    private Map<String, Object> readBody(HttpServletRequest request) throws IOException {
        return gson.fromJson(request.getReader(), mapType);
    }

    private Map<String, Object> ok(String key, Object value) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ok", true);
        response.put(key, value);
        return response;
    }

    private Map<String, Object> simple(boolean ok) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ok", ok);
        return response;
    }

    private void write(HttpServletResponse response, Object data) throws IOException {
        response.getWriter().print(gson.toJson(data));
    }

    private void notFound(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        write(response, Map.of("ok", false, "mensaje", "Ruta de administrador no encontrada"));
    }

    private void error(HttpServletResponse response, Exception e) throws IOException {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        write(response, Map.of("ok", false, "mensaje", e.getMessage() == null ? "Error en el servidor" : e.getMessage()));
    }

    private void cors(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}
