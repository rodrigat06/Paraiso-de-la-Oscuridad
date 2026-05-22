package com.ejemplo.controller;

import com.ejemplo.model.UsuarioRegisterModel;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;

@WebServlet("/auth/register")
public class AuthRegisterController extends HttpServlet {

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

        JsonObject obj = Json.createReader(new StringReader(sb.toString())).readObject();
        String nombre = obj.getString("nombre");
        String apellido = obj.getString("apellidos");
        String email = obj.getString("email");
        String password = obj.getString("password");

        UsuarioRegisterModel model = new UsuarioRegisterModel();
        boolean ok = model.registrar(nombre, apellido, email, password);

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if (ok) {
            out.print("{\"ok\": true}");
        } else {
            out.print("{\"ok\": false, \"mensaje\": \"El correo electrónico ya existe o hay un error en el servidor\"}");
        }
    }
}
