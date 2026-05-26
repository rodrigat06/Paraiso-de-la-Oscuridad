package com.ejemplo.controller;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;

import com.ejemplo.model.UsuarioLoginModel;
import com.ejemplo.model.UsuarioSesion;

@WebServlet("/auth/login")
public class AuthLoginController extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        request.setCharacterEncoding("UTF-8");

        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;

        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }

        JsonObject obj;
        try {
            obj = Json.createReader(new StringReader(sb.toString())).readObject();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json; charset=UTF-8");
            response.getWriter().print("{\"ok\": false, \"mensaje\": \"Solicitud no valida\"}");
            return;
        }
        String email = obj.getString("email");
        String password = obj.getString("password");

        UsuarioLoginModel model = new UsuarioLoginModel();

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            UsuarioSesion usuario = model.validar(email, password);

            if (usuario != null) {
                HttpSession sesion = request.getSession();
                sesion.setAttribute("idUsuario", usuario.getId());
                sesion.setAttribute("email", usuario.getEmail());
                sesion.setAttribute("rol", usuario.getRol());
                JsonObject json = Json.createObjectBuilder()
                        .add("ok", true)
                        .add("email", usuario.getEmail())
                        .add("rol", usuario.getRol())
                        .build();
                out.print(json.toString());
            } else {
                out.print("{\"ok\": false, \"mensaje\": \"Credenciales incorrectas\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"ok\": false, \"mensaje\": \"No se pudo conectar con MySQL\"}");
        }
    }
}
