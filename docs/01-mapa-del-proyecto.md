# 01 - Mapa del proyecto

Este documento explica donde esta cada cosa sin palabras raras.

## Carpetas principales

```text
.
├── src/main/java/          Servidor Java: recibe peticiones y habla con MySQL.
├── src/main/webapp/        Web visible: HTML, CSS, JS, imagenes, audio y video.
├── mysql/init/             SQL para crear las tablas de MySQL.
├── Dockerfile              Instrucciones para arrancar en Railway.
├── docker-compose.yml      Arranque local con Docker.
├── pom.xml                 Configuracion Maven del proyecto Java.
└── docs/                   Explicaciones para entender y limpiar el proyecto.
```

## `src/main/webapp`

Esta es la carpeta mas importante para la parte visual.

```text
src/main/webapp/
├── index.html                     Primera pagina de la web.
├── Menú.html                      Menu principal despues de entrar.
├── Registrarse/                   Pagina de registro.
├── Inicio de Sesion/              Pagina de login.
├── administrador/                 Panel de administrador nuevo.
├── Jazmin Bean/                   Paginas, imagenes, audios y videos de Jazmin.
├── Melanie Martinez/              Paginas, imagenes, audios y videos de Melanie.
├── significados-canciones/        Ruta servida por Java para significados.
├── Assets/                        CSS y JS compartidos.
├── recursos/                      Otra carpeta de recursos compartidos.
└── paginas/inicio/                CSS y JS del index.
```

## Problema actual de organizacion

Hay tres problemas grandes:

1. Algunas carpetas usan espacios y tildes, por ejemplo `Inicio de Sesion`, `Menú.html`, `contraseña olvidada`.
2. Las carpetas duplicadas antiguas ya se eliminaron. Queda solo el codigo que carga la web.
3. Hay CSS y JS muy largos que hacen muchas cosas a la vez.

Eso no significa que la web este mal hecha. Significa que ha crecido rapido y ahora toca ordenarla.

## Estructura recomendada para dejarla limpia

Esta seria la estructura simple ideal:

```text
src/main/webapp/
├── index.html
├── pages/
│   ├── auth/
│   │   ├── login.html
│   │   ├── register.html
│   │   └── recover.html
│   ├── menu/
│   │   └── index.html
│   ├── admin/
│   │   └── index.html
│   ├── artists/
│   │   ├── jazmin/
│   │   ├── melanie/
│   │   └── custom/
│   └── meanings/
├── assets/
│   ├── css/
│   ├── js/
│   ├── img/
│   ├── audio/
│   └── video/
```

## Traduccion de nombres

| Ahora | Limpio |
| --- | --- |
| `Inicio de Sesion/Inicio de Sesion.html` | `pages/auth/login.html` |
| `Registrarse/Registrarse.html` | `pages/auth/register.html` |
| `contraseña olvidada/Contraseña olvidada.html` | `pages/auth/recover.html` |
| `Menú.html` | `pages/menu/index.html` |
| `administrador/admin.html` | `pages/admin/index.html` |
| `Jazmin Bean/` | `pages/artists/jazmin/` |
| `Melanie Martinez/` | `pages/artists/melanie/` |
| `significados-canciones/` | `pages/meanings/` |

Nota: los significados ya no viven como 63 HTML sueltos. Ahora usan una plantilla unica en `Jazmin Bean/significado.html` y datos en `Jazmin Bean/data/significados.json`.

Las carpetas de artistas son autosuficientes: lo especifico de Jazmin queda en `Jazmin Bean/` y lo especifico de Melanie queda en `Melanie Martinez/`.

## Regla para mover archivos

No se mueve nada sin actualizar:

- Enlaces `href`.
- Imagenes `src`.
- CSS `<link>`.
- Scripts `<script>`.
- Rutas usadas desde JavaScript.
- Rutas que Railway ya sirve.

Si no se hace asi, una pagina carga pero se queda sin estilos, sin imagenes o sin login.
