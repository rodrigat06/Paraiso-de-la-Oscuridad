package com.ejemplo.controller;

import com.ejemplo.model.AdminModel;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

@WebServlet("/admin/advertirUsuario")
public class AdvertirUsuarioController extends HttpServlet {
    private final Gson gson = new Gson();
    private final AdminModel model = new AdminModel();

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");

        try {
            JsonObject body = gson.fromJson(request.getReader(), JsonObject.class);
            String email = body != null && body.has("email") ? body.get("email").getAsString() : "";
            String motivo = body != null && body.has("motivo") ? body.get("motivo").getAsString() : "";
            boolean ok = model.advertirUsuario(email, motivo);
            response.getWriter().print(gson.toJson(Map.of("ok", ok)));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print(gson.toJson(Map.of("ok", false, "mensaje", e.getMessage())));
        }
    }
}
