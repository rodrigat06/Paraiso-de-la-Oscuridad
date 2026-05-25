# Webapp explicada

Esta carpeta contiene todo lo que ve el usuario en el navegador.

## Que es cada tipo de archivo

```text
*.html  Estructura de cada pagina.
*.css   Estilos: colores, tamanos, posicion y responsive.
*.js    Comportamiento: clicks, login, llamadas al servidor, guardar datos.
*.jpg   Imagenes.
*.png   Imagenes con posible transparencia.
*.gif   Animaciones.
*.mp3   Audio.
*.mp4   Video.
```

## Archivos importantes

```text
index.html
```

Primera pagina que se abre al entrar a la web.

```text
Menú.html
```

Menu principal de la web.

```text
Assets/css/responsive-fix.css
```

Arreglo global para que la web se adapte a movil, tablet y ordenador.

```text
Assets/js/sql-storage.js
```

Codigo compartido que ayuda a guardar datos y hablar con el servidor.

## Cuidado con mover cosas

Si mueves un HTML, hay que revisar todas sus rutas:

```html
<link rel="stylesheet" href="...">
<script src="..."></script>
<img src="...">
<a href="...">
```

Si una ruta queda mal, la pagina carga incompleta.
