# Paraiso de la Oscuridad

Proyecto web hecho con:

- HTML, CSS y JavaScript para la parte visual.
- Java Jakarta Servlet para el servidor.
- MySQL para guardar usuarios, reservas, ayuda, resenas, estado de la app y archivos.
- Railway para desplegar la web y la base de datos.

## Donde empiezo si no entiendo nada

Lee estos archivos en este orden:

1. [docs/01-mapa-del-proyecto.md](docs/01-mapa-del-proyecto.md)
2. [docs/02-como-se-conecta-todo.md](docs/02-como-se-conecta-todo.md)
3. [docs/03-plan-de-simplificacion.md](docs/03-plan-de-simplificacion.md)

## Regla de oro

Ahora mismo la web funciona en Railway. Antes de renombrar archivos o mover carpetas hay que comprobar enlaces, CSS, JS y rutas del servidor. Si se cambia una ruta sin actualizar sus enlaces, la pagina puede verse rota o dejar de cargar.

## Estructura actual resumida

```text
src/main/java/                  Codigo Java del servidor
src/main/webapp/                Paginas, CSS, JS, imagenes, audio y video
mysql/init/01-bd1.sql           SQL inicial de la base de datos
Dockerfile                      Como Railway construye la app
pom.xml                         Dependencias Java y empaquetado WAR
```

## Estado de limpieza

La web ya tiene una capa responsive global en:

```text
src/main/webapp/Assets/css/responsive-fix.css
```

Esa capa se carga en todos los HTML para que telefono, tablet y ordenador no rompan el ancho de la pagina.

Tambien se eliminaron duplicados exactos y las paginas repetidas de significados se convirtieron en una sola plantilla con datos JSON.

## Comprobar que no se ha roto la web

Este comando abre todas las paginas HTML en modo movil y avisa si hay errores JavaScript, recursos 404 o desbordes:

```bash
node tools/check-webapp.mjs
```
