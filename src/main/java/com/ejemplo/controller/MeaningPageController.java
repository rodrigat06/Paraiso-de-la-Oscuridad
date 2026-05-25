package com.ejemplo.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/significados-canciones/*")
public class MeaningPageController extends HttpServlet {

    /*
     * Antes habia una pagina HTML por cada cancion.
     * Ahora cualquier URL dentro de /significados-canciones/ sirve la misma
     * plantilla y JavaScript decide que cancion pintar leyendo el slug.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/html; charset=UTF-8");
        request.getRequestDispatcher("/WEB-INF/templates/significado.html").forward(request, response);
    }
}
