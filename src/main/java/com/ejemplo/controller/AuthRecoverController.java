package com.ejemplo.controller;

import com.ejemplo.model.BloqueoUsuarioModel;
import com.ejemplo.model.UsuarioRecoveryModel;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;

@WebServlet(urlPatterns = {"/auth/recover/check", "/auth/recover/reset"})
public class AuthRecoverController extends HttpServlet {

    private final UsuarioRecoveryModel model = new UsuarioRecoveryModel();

    private void setCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        setCorsHeaders(response);
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setCorsHeaders(response);
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        JsonObject body;
        try {
            body = readJson(request);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(response, Json.createObjectBuilder()
                    .add("ok", false)
                    .add("mensaje", "Solicitud no válida")
                    .build());
            return;
        }

        try {
            String path = request.getServletPath();

            if (path.endsWith("/check")) {
                checkAccount(body, response);
                return;
            }

            if (path.endsWith("/reset")) {
                resetPassword(body, response);
                return;
            }

            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            writeJson(response, Json.createObjectBuilder()
                    .add("ok", false)
                    .add("mensaje", "Ruta no encontrada")
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(response, Json.createObjectBuilder()
                    .add("ok", false)
                    .add("mensaje", "No se pudo procesar la recuperación")
                    .build());
        }
    }

    private void checkAccount(JsonObject body, HttpServletResponse response) throws Exception {
        String email = body.getString("email", "").trim().toLowerCase();

        if (!isValidEmail(email)) {
            writeJson(response, Json.createObjectBuilder()
                    .add("ok", false)
                    .add("mensaje", "Introduce un correo electrónico válido")
                    .build());
            return;
        }

        if (BloqueoUsuarioModel.estaBloqueado(email)) {
            writeJson(response, Json.createObjectBuilder()
                    .add("ok", false)
                    .add("mensaje", "Cuenta bloqueada. Contacta con el administrador")
                    .build());
            return;
        }

        String nombre = model.obtenerNombrePorEmail(email);
        if (nombre == null) {
            writeJson(response, Json.createObjectBuilder()
                    .add("ok", false)
                    .add("mensaje", "No existe una cuenta con ese correo")
                    .build());
            return;
        }

        JsonObjectBuilder builder = Json.createObjectBuilder()
                .add("ok", true)
                .add("email", email);

        if (!nombre.isBlank()) {
            builder.add("nombre", nombre);
        }

        writeJson(response, builder.build());
    }

    private void resetPassword(JsonObject body, HttpServletResponse response) throws Exception {
        String email = body.getString("email", "").trim().toLowerCase();
        String password = body.getString("password", "").trim();

        if (!isValidEmail(email)) {
            writeJson(response, Json.createObjectBuilder()
                    .add("ok", false)
                    .add("mensaje", "Introduce un correo electrónico válido")
                    .build());
            return;
        }

        if (password.length() < 6) {
            writeJson(response, Json.createObjectBuilder()
                    .add("ok", false)
                    .add("mensaje", "La contraseña debe tener al menos 6 caracteres")
                    .build());
            return;
        }

        if (BloqueoUsuarioModel.estaBloqueado(email)) {
            writeJson(response, Json.createObjectBuilder()
                    .add("ok", false)
                    .add("mensaje", "Cuenta bloqueada. Contacta con el administrador")
                    .build());
            return;
        }

        boolean ok = model.cambiarPassword(email, password);
        writeJson(response, Json.createObjectBuilder()
                .add("ok", ok)
                .add("mensaje", ok
                        ? "Contraseña actualizada"
                        : "No se pudo cambiar la contraseña")
                .build());
    }

    private JsonObject readJson(HttpServletRequest request) throws IOException {
        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;

        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }

        return Json.createReader(new StringReader(sb.toString())).readObject();
    }

    private void writeJson(HttpServletResponse response, JsonObject json) throws IOException {
        PrintWriter out = response.getWriter();
        out.print(json.toString());
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    }
}
