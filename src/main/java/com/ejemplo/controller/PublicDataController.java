package com.ejemplo.controller;

import com.ejemplo.model.AdminModel;
import com.ejemplo.model.AppStateModel;
import com.ejemplo.model.MediaModel;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/*")
@MultipartConfig(maxFileSize = 50L * 1024L * 1024L, maxRequestSize = 55L * 1024L * 1024L)
public class PublicDataController extends HttpServlet {
    private final Gson gson = new Gson();
    private final AdminModel model = new AdminModel();
    private final AppStateModel stateModel = new AppStateModel();
    private final MediaModel mediaModel = new MediaModel();
    private final Type mapType = new TypeToken<Map<String, Object>>() {}.getType();

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        cors(response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        cors(response);
        String path = request.getPathInfo() == null ? "/" : request.getPathInfo();

        try {
            if ("/media".equals(path)) {
                servirMedia(request, response);
                return;
            }

            response.setContentType("application/json;charset=UTF-8");
            switch (path) {
                case "/state" -> {
                    String email = request.getParameter("email");
                    write(response, ok("estado", stateModel.listar(email)));
                }
                default -> {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    write(response, Map.of("ok", false, "mensaje", "Ruta no encontrada"));
                }
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            write(response, Map.of("ok", false, "mensaje", e.getMessage() == null ? "Error en el servidor" : e.getMessage()));
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        cors(response);
        String path = request.getPathInfo() == null ? "/" : request.getPathInfo();

        if ("/media".equals(path)) {
            response.setContentType("application/json;charset=UTF-8");
            try {
                Part archivo = request.getPart("archivo");
                if (archivo == null || archivo.getSize() == 0) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    write(response, Map.of("ok", false, "mensaje", "No se ha recibido ningun archivo."));
                    return;
                }

                int id;
                try (InputStream input = archivo.getInputStream()) {
                    id = mediaModel.guardar(archivo.getSubmittedFileName(), archivo.getContentType(), input);
                }

                write(response, Map.of("ok", true, "id", id, "url", request.getContextPath() + "/api/media?id=" + id));
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                write(response, Map.of("ok", false, "mensaje", e.getMessage() == null ? "No se pudo guardar el archivo" : e.getMessage()));
            }
            return;
        }

        response.setContentType("application/json;charset=UTF-8");
        Map<String, Object> body = gson.fromJson(request.getReader(), mapType);

        try {
            switch (path) {
                case "/state" -> {
                    String clave = String.valueOf(body.get("clave"));
                    String email = body.get("email") == null ? "" : String.valueOf(body.get("email"));
                    String valor = body.get("valor") == null ? "" : String.valueOf(body.get("valor"));
                    boolean global = Boolean.TRUE.equals(body.get("global"));
                    write(response, simple(stateModel.guardar(clave, email, valor, global)));
                }
                case "/state/eliminar" -> {
                    String clave = String.valueOf(body.get("clave"));
                    String email = body.get("email") == null ? "" : String.valueOf(body.get("email"));
                    boolean global = Boolean.TRUE.equals(body.get("global"));
                    write(response, simple(stateModel.eliminar(clave, email, global)));
                }
                case "/reservas" -> write(response, ok("reserva", model.crearReserva(body)));
                case "/reservas/cancelar" -> {
                    int id = ((Number) body.get("id")).intValue();
                    write(response, simple(model.cancelarReserva(id)));
                }
                case "/ayuda" -> write(response, simple(model.crearAyuda(body)));
                case "/resenas" -> write(response, simple(model.crearResena(body)));
                default -> {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    write(response, Map.of("ok", false, "mensaje", "Ruta no encontrada"));
                }
            }
        } catch (IllegalStateException e) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            write(response, Map.of("ok", false, "mensaje", e.getMessage()));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            write(response, Map.of("ok", false, "mensaje", e.getMessage() == null ? "Error en el servidor" : e.getMessage()));
        }
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

    private void servirMedia(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String idParam = request.getParameter("id");
        if (idParam == null || idParam.isBlank()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json;charset=UTF-8");
            write(response, Map.of("ok", false, "mensaje", "Falta el id del archivo."));
            return;
        }

        MediaModel.Archivo archivo = mediaModel.obtener(Integer.parseInt(idParam));
        if (archivo == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.setContentType("application/json;charset=UTF-8");
            write(response, Map.of("ok", false, "mensaje", "Archivo no encontrado."));
            return;
        }

        response.setContentType(archivo.contentType());
        response.setHeader("Content-Disposition", "inline; filename=\"" + archivo.nombre().replace("\"", "") + "\"");
        response.setContentLength(archivo.datos().length);
        response.getOutputStream().write(archivo.datos());
    }

    private void cors(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}
