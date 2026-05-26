package com.ejemplo.model;

public class UsuarioSesion {
    private final int id;
    private final String email;
    private final String rol;

    public UsuarioSesion(int id, String email, String rol) {
        this.id = id;
        this.email = email;
        this.rol = rol;
    }

    public int getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRol() {
        return rol;
    }

    public boolean esAdmin() {
        return "ADMIN".equalsIgnoreCase(rol);
    }
}
