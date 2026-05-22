package com.ejemplo.controller;

import com.ejemplo.model.AdminModel;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

@WebServlet("/admin/listarUsuarios")
public class ListarUsuariosController extends HttpServlet {
    private final Gson gson = new Gson();
    private final AdminModel model = new AdminModel();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");

        try {
            response.getWriter().print(gson.toJson(model.listarUsuarios()));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print(gson.toJson(Map.of("ok", false, "mensaje", e.getMessage())));
        }
    }
}
