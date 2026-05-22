package com.ejemplo.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import com.ejemplo.model.BloqueoUsuarioModel;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/admin/desbloquear")
public class DesbloquearUsuarioController extends HttpServlet {

    private void setCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setCorsHeaders(response);
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        setCorsHeaders(response);
        response.setContentType("application/json; charset=UTF-8");

        if (!isAdmin(request)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().print("{\"ok\": false, \"mensaje\": \"Acceso solo para administradores\"}");
            return;
        }

        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;

        while ((line = reader.readLine()) != null) sb.append(line);

        JsonObject obj = Json.createReader(new java.io.StringReader(sb.toString())).readObject();
        String email = obj.getString("email", "").trim().toLowerCase();

        try {
            boolean ok = BloqueoUsuarioModel.desbloquear(email);
            PrintWriter out = response.getWriter();
            out.print(ok ? "{\"ok\": true}" : "{\"ok\": false, \"mensaje\": \"Correo electrónico no válido\"}");

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"ok\": false, \"mensaje\": \"No se pudo desbloquear el usuario\"}");
        }
    }

    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null && "ADMIN".equals(String.valueOf(session.getAttribute("rol")));
    }
}
