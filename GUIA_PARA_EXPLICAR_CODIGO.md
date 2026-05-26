# Guia para explicar el codigo de Paraiso de la Oscuridad

Esta guia sirve para estudiar el proyecto y poder explicar como se conecta cada parte. La idea principal es:

1. El usuario entra a la web.
2. Si no ha iniciado sesion, `LoginFilter.java` lo manda al login.
3. El login llama a `/auth/login`.
4. El backend comprueba el usuario en MySQL.
5. Si todo esta bien, se crea una sesion.
6. La web ya permite abrir portada, explorar, fichas y guia.
7. El administrador solo se abre si la sesion tiene rol `ADMIN`.

## Mapa rapido de carpetas

- `src/main/java/com/ejemplo/controller/`: aqui estan los controladores y filtros. Son la parte del servidor que recibe peticiones.
- `src/main/java/com/ejemplo/model/`: aqui estan las clases que hablan con MySQL y preparan datos.
- `src/main/webapp/`: aqui esta la parte visual: HTML, CSS, JS, imagenes y audios.
- `src/main/webapp/WEB-INF/web.xml`: configura el archivo inicial de la web.
- `src/main/webapp/README.md`: lista simple de archivos del frontend.

## Flujo de entrada a la pagina

Cuando alguien abre la web:

```text
Navegador
  -> Railway / Tomcat
  -> LoginFilter.java
  -> si NO hay sesion: login/login.html
  -> si SI hay sesion: pagina-principal.html
```

El archivo que hace esa proteccion es:

`src/main/java/com/ejemplo/controller/LoginFilter.java`

- `@WebFilter("/*")`: significa que este filtro revisa todas las rutas de la web.
- `doFilter(...)`: se ejecuta cada vez que alguien pide una pagina, CSS, JS o endpoint.
- `path = requestURI...`: obtiene la ruta que se esta intentando abrir.
- `esRutaPublica(path)`: permite abrir login, registro, recuperar y `/auth/` sin haber iniciado sesion.
- `tieneSesion(httpRequest)`: comprueba si existe una sesion con `idUsuario`.
- `chain.doFilter(...)`: deja pasar la peticion si esta permitida.
- `sendRedirect("/login/login.html")`: manda al login si no hay sesion.

## Flujo de administrador

El administrador tiene una segunda proteccion:

```text
Navegador
  -> /administrador/administrador.html
  -> LoginFilter.java comprueba que hay sesion
  -> AdminFilter.java comprueba que el rol sea ADMIN
  -> si es ADMIN: entra
  -> si no es ADMIN: login/login.html?admin=1
```

Archivo:

`src/main/java/com/ejemplo/controller/AdminFilter.java`

- `@WebFilter("/administrador/*")`: solo revisa rutas dentro de la carpeta `administrador`.
- `getSession(false)`: busca una sesion existente sin crear una nueva.
- `session.getAttribute("rol")`: lee el rol guardado al iniciar sesion.
- `"ADMIN".equalsIgnoreCase(...)`: comprueba que el rol sea administrador.
- `chain.doFilter(...)`: deja entrar al panel.
- `sendRedirect("/login/login.html?admin=1")`: si no es admin, vuelve al login con una señal para mostrar aviso.

## Login completo

### Frontend del login

Archivo:

`src/main/webapp/login/login.html`

- `<!DOCTYPE html>`: indica que es un documento HTML moderno.
- `<html lang="es">`: marca la pagina como español.
- `<meta charset="UTF-8">`: permite tildes y caracteres especiales.
- `<meta name="viewport"...>`: hace que se adapte a movil.
- `<link rel="stylesheet" href="login.css">`: conecta este HTML con su CSS.
- `<main class="auth-page">`: contenedor principal de la pantalla de login.
- `<form id="loginForm">`: formulario que el JS captura para enviar los datos.
- `<input id="email"...>`: campo del correo.
- `<input id="password"...>`: campo de contraseña.
- `<p id="message">`: zona donde el JS escribe errores o avisos.
- `<script src="login.js">`: conecta el HTML con la logica del login.

Archivo:

`src/main/webapp/login/login.js`

- `const form = document.querySelector("#loginForm")`: busca el formulario del HTML.
- `const message = document.querySelector("#message")`: busca el texto de avisos.
- `new URLSearchParams(location.search)`: lee si la URL trae `?admin=1`.
- `if (wantsAdmin)`: si alguien intentaba entrar al admin, muestra aviso.
- `form.addEventListener("submit", ...)`: cuando se pulsa Entrar, no recarga la pagina y ejecuta JS.
- `event.preventDefault()`: evita que el formulario envie la pagina de forma clasica.
- `const data = { email, password }`: crea el objeto que se enviara al backend.
- `fetch("/auth/login", ...)`: llama al controlador Java `AuthLoginController`.
- `headers`: dice que se manda y recibe JSON.
- `body: JSON.stringify(data)`: convierte el objeto JS en texto JSON.
- `await response.json()`: lee la respuesta del servidor.
- `localStorage.setItem("user-email", ...)`: guarda el email en el navegador.
- `localStorage.setItem("user-role", ...)`: guarda el rol en el navegador para uso visual.
- `window.location.href = ...`: redirige al administrador si es admin, o a explorar si es usuario normal.

### Backend del login

Archivo:

`src/main/java/com/ejemplo/controller/AuthLoginController.java`

- `@WebServlet("/auth/login")`: crea la ruta `/auth/login`.
- `doOptions(...)`: permite peticiones previas del navegador.
- `doPost(...)`: se ejecuta cuando `login.js` hace `fetch` con metodo `POST`.
- `request.setCharacterEncoding("UTF-8")`: lee bien tildes y caracteres especiales.
- `request.getReader()`: lee el JSON enviado desde el navegador.
- `Json.createReader(...)`: convierte el texto JSON en objeto Java.
- `obj.getString("email")`: saca el email.
- `obj.getString("password")`: saca la contraseña.
- `UsuarioLoginModel model = new UsuarioLoginModel()`: crea la clase que consulta MySQL.
- `model.validar(email, password)`: comprueba si existe ese usuario.
- `request.getSession()`: crea o recupera la sesion del usuario.
- `sesion.setAttribute("idUsuario", ...)`: guarda el id para saber que esta logueado.
- `sesion.setAttribute("email", ...)`: guarda el email.
- `sesion.setAttribute("rol", ...)`: guarda si es `USER` o `ADMIN`.
- `Json.createObjectBuilder()`: crea la respuesta JSON.
- `out.print(json.toString())`: devuelve el resultado al navegador.

Archivo:

`src/main/java/com/ejemplo/model/UsuarioLoginModel.java`

- `SchemaModel.asegurarSchema()`: antes de consultar, se asegura de que la tabla existe.
- `ConexionBD.getConnection()`: abre conexion con MySQL.
- `PreparedStatement`: prepara una consulta SQL segura.
- `SELECT id, email, rol FROM usuarios...`: busca un usuario con ese email y contraseña.
- `LOWER(email) = LOWER(?)`: permite que el email no dependa de mayusculas.
- `bloqueado = FALSE`: impide entrar a usuarios bloqueados.
- `ps.setString(...)`: mete valores en los signos `?`.
- `rs.next()`: comprueba si MySQL encontro una fila.
- `new UsuarioSesion(...)`: devuelve un objeto con id, email y rol.
- `return null`: si no encontro usuario, login incorrecto.

Archivo:

`src/main/java/com/ejemplo/model/UsuarioSesion.java`

- Guarda los datos basicos del usuario logueado.
- `getId()`: devuelve el id.
- `getEmail()`: devuelve el email.
- `getRol()`: devuelve el rol.
- `esAdmin()`: devuelve true si el rol es `ADMIN`.

## Registro

Archivo:

`src/main/webapp/registro/registro.html`

- Muestra el formulario para crear cuenta.
- Tiene campos de nombre, apellido, email y password.
- Carga `registro.css` para el diseño.
- Carga `registro.js` para enviar los datos.

Archivo:

`src/main/webapp/registro/registro.js`

- Captura `#registerForm`.
- Lee `nombre`, `apellido`, `email` y `password`.
- Llama a `/auth/register` con `fetch`.
- Si el servidor responde bien, muestra que la cuenta se ha creado.

Archivo:

`src/main/java/com/ejemplo/controller/AuthRegisterController.java`

- `@WebServlet("/auth/register")`: crea el endpoint del registro.
- Lee el JSON enviado por `registro.js`.
- Saca nombre, apellidos, email y password.
- Llama a `UsuarioRegisterModel`.
- Devuelve `{ "ok": true }` si se crea.

Archivo:

`src/main/java/com/ejemplo/model/UsuarioRegisterModel.java`

- Abre conexion con MySQL.
- Llama a `SchemaModel.asegurarSchema(con)`.
- Hace `INSERT INTO usuarios (...)`.
- Las cuentas nuevas entran como `USER` porque la columna `rol` tiene `DEFAULT 'USER'`.

## Recuperar contraseña

Archivos:

- `src/main/webapp/recuperar/recuperar.html`
- `src/main/webapp/recuperar/recuperar.css`
- `src/main/webapp/recuperar/recuperar.js`
- `src/main/java/com/ejemplo/controller/AuthRecoverController.java`
- `src/main/java/com/ejemplo/model/UsuarioRecoveryModel.java`

Funcionamiento:

1. El usuario escribe su email.
2. `recuperar.js` llama a `/auth/recover/check`.
3. El backend comprueba si existe.
4. Si existe, permite cambiar la contraseña.
5. `recuperar.js` llama a `/auth/recover/reset`.
6. `UsuarioRecoveryModel` actualiza la contraseña en MySQL.

## Base de datos

Archivo:

`src/main/java/com/ejemplo/model/ConexionBD.java`

Sirve para abrir conexion con MySQL usando las variables de Railway:

- host
- puerto
- nombre de base de datos
- usuario
- contraseña

Archivo:

`src/main/java/com/ejemplo/model/SchemaModel.java`

Este archivo prepara la tabla de usuarios:

- `CREATE TABLE IF NOT EXISTS usuarios`: crea la tabla si no existe.
- `id`: identificador automatico.
- `nombre`: nombre del usuario.
- `apellido`: apellido.
- `email`: correo unico.
- `password`: contraseña.
- `rol`: `USER` o `ADMIN`.
- `creado_en`: fecha de creacion.
- `anadirColumnaSiFalta(...)`: añade columnas nuevas si la tabla ya existia de antes.
- Inserta o actualiza la cuenta `admin@test.com` con rol `ADMIN`.

## Portada

Archivos:

- `src/main/webapp/pagina-principal.html`
- `src/main/webapp/inicio/pagina-principal.css`
- `src/main/webapp/inicio/pagina-principal.js`

Conexion:

- `web.xml` dice que la portada inicial es `pagina-principal.html`.
- El HTML enlaza el CSS con `inicio/pagina-principal.css`.
- El HTML enlaza el JS con `inicio/pagina-principal.js`.
- Los botones llevan a `explorar/explorar.html`, `administrador/administrador.html`, `guia/guia.html` y `login/login.html`.

El JS de portada solo marca enlaces activos. No hace nada pesado.

## Explorar artistas

Archivos:

- `src/main/webapp/explorar/explorar.html`
- `src/main/webapp/explorar/explorar.css`
- `src/main/webapp/explorar/explorar.js`

Conexion:

- `explorar.html` carga `../artistas/artist-store.js`.
- `explorar.html` carga `../artistas/media-store.js`.
- `explorar.html` carga `explorar.js`.

Archivo:

`src/main/webapp/explorar/explorar.js`

- `search`: guarda el input del buscador.
- `grid`: guarda el contenedor donde salen artistas.
- `artistLink(artist)`: decide a que ficha va cada artista.
- `imageAttributes(...)`: prepara imagen normal o imagen guardada desde ordenador.
- `artistCard(artist)`: crea el HTML de una tarjeta de artista.
- `paintArtists()`: pinta todos los artistas en pantalla.
- `filterCards()`: oculta tarjetas que no coinciden con la busqueda.
- `search.addEventListener("input", ...)`: hace que el buscador funcione mientras escribes.

## Datos de artistas

Archivo:

`src/main/webapp/artistas/artist-store.js`

Este es uno de los archivos mas importantes.

- `ARTIST_STORAGE_KEY`: nombre usado para guardar artistas editados en `localStorage`.
- `defaultArtists`: lista base con Jazmin Bean y Melanie Martinez.
- Cada artista tiene:
  - `slug`: identificador para URL.
  - `name`: nombre visible.
  - `genre`: genero musical.
  - `cover`: imagen principal.
  - `page`: ficha fija del artista.
  - `bio`: biografia.
  - `releases`: albumes, EPs y singles.
- Cada lanzamiento tiene:
  - `title`: titulo.
  - `cover`: portada.
  - `note`: descripcion corta.
  - `tracks`: canciones.
- Cada cancion es un array:
  - posicion 0: titulo.
  - posicion 1: audio.
  - posicion 2: imagen.

Funciones:

- `readCustomArtists()`: lee artistas guardados desde administrador.
- `saveCustomArtists(artists)`: guarda artistas en el navegador.
- `slugify(text)`: convierte un nombre en identificador URL.
- `allArtists()`: mezcla artistas base y artistas editados.
- `findArtist(slug)`: busca un artista concreto.
- `saveArtist(artist)`: guarda o actualiza un artista.
- `assetUrl(path, prefix)`: prepara rutas de imagen/audio dependiendo desde donde se abra la pagina.
- `window.artistStore = ...`: deja esas funciones disponibles para otros JS.

## Imagenes y audios del ordenador

Archivo:

`src/main/webapp/artistas/media-store.js`

Este archivo permite elegir archivos del ordenador desde el administrador.

- Usa `IndexedDB`, que es almacenamiento interno del navegador.
- `MEDIA_DB_NAME`: nombre de la base local del navegador.
- `MEDIA_STORE_NAME`: nombre del almacen de archivos.
- `MEDIA_PREFIX = "media:"`: marca que una ruta no es una URL normal, sino un archivo guardado.
- `openMediaDb()`: abre o crea la base local.
- `createMediaId(file)`: crea un identificador unico para cada archivo.
- `saveFile(file)`: guarda el archivo elegido.
- `readFile(ref)`: recupera un archivo guardado.
- `resolve(ref)`: convierte `media:...` en una URL temporal que el navegador puede mostrar o reproducir.
- `isMediaRef(value)`: comprueba si un valor empieza por `media:`.
- `hydrate(root)`: busca imagenes o audios con `data-media-src` y les pone el archivo real.
- `window.artistMedia = ...`: deja estas funciones disponibles para las fichas y administrador.

## Fichas de artistas

Archivos fijos:

- `src/main/webapp/artistas/jazmin-bean/jazmin-bean.html`
- `src/main/webapp/artistas/jazmin-bean/jazmin-bean.css`
- `src/main/webapp/artistas/jazmin-bean/jazmin-bean.js`
- `src/main/webapp/artistas/melanie-martinez/melanie-martinez.html`
- `src/main/webapp/artistas/melanie-martinez/melanie-martinez.css`
- `src/main/webapp/artistas/melanie-martinez/melanie-martinez.js`

Funcionamiento:

- El HTML tiene la estructura visual: cabecera, hero, buscador, biografia y secciones.
- El CSS da la estetica rosa/negra pixelada.
- El JS carga el artista desde `artist-store.js`.
- El JS pinta albumes, EPs, singles y canciones.

Funciones importantes en los JS de artista:

- `findArtist("jazmin-bean")` o `findArtist("melanie-martinez")`: busca los datos.
- `setImage(...)`: pone imagen normal o imagen guardada desde ordenador.
- `imageAttributes(...)`: crea atributos para imagenes.
- `audioSource(...)`: crea el `<source>` del audio.
- `trackTemplate(track)`: crea una tarjeta de cancion con portada, vinilo y audio.
- `renderSection(id, title, releases)`: pinta albumes, EPs o singles.
- Buscador: oculta lanzamientos que no coinciden.

## Ficha dinamica

Archivos:

- `src/main/webapp/artistas/ficha/ficha-artista.html`
- `src/main/webapp/artistas/ficha/ficha-artista.js`

Sirve para artistas creados desde el administrador.

Conexion:

- La URL lleva `?artist=slug`.
- `ficha-artista.js` lee ese `slug`.
- Busca el artista con `findArtist(slug)`.
- Si existe, pinta su ficha.
- Si no existe, muestra un aviso.

## Administrador

Archivos:

- `src/main/webapp/administrador/administrador.html`
- `src/main/webapp/administrador/administrador.css`
- `src/main/webapp/administrador/administrador.js`

Conexion:

- El HTML tiene formularios.
- El CSS ordena y da estetica.
- El JS guarda artistas, lanzamientos y canciones.
- El filtro Java `AdminFilter.java` decide si puedes entrar.

Archivo:

`src/main/webapp/administrador/administrador.js`

Partes principales:

- `currentArtist`: artista que se esta creando o editando.
- `emptyArtist()`: crea un artista vacio.
- `clone(data)`: copia datos sin modificar el original.
- `field(id)`: atajo para buscar campos del formulario.
- `releaseLabel(type)`: traduce `albums`, `eps`, `singles` a texto visible.
- `savePickedFile(...)`: guarda imagen o audio elegido desde ordenador.
- `fillArtistSelect()`: llena el desplegable de artistas.
- `loadArtist(slug)`: carga un artista existente en el formulario.
- `syncArtistFields()`: copia lo escrito en el formulario dentro de `currentArtist`.
- `renderEditor()`: muestra la lista editable de albumes, EPs, singles y canciones.
- Evento de `addRelease`: añade album, EP o single.
- Evento de `addTrack`: añade una cancion al lanzamiento seleccionado.
- Evento de borrar: elimina lanzamientos o canciones.
- Evento de `saveArtist`: guarda todo con `artistStore.saveArtist(...)`.

## Guia visual

Archivos:

- `src/main/webapp/guia/guia.html`
- `src/main/webapp/guia/guia.css`

Sirve para explicar al usuario como esta organizada la pagina.

## CSS explicado de forma comun

Los CSS se repiten con una estructura parecida:

- `:root`: define colores reutilizables, por ejemplo rosa, azul, fondo y texto.
- `* { box-sizing: border-box; }`: hace que los tamaños sean mas faciles de controlar.
- `body`: define fondo, fuente, color y altura minima.
- `a`: quita subrayados.
- `img`: hace que las imagenes no se salgan.
- `.topbar`: cabecera superior.
- `.brand`: logo + nombre.
- `.nav`: botones de navegacion.
- `.panel`: cajas de contenido.
- `.button` o `button`: botones.
- `@media`: reglas especiales para movil.

La conexion es:

```html
<link rel="stylesheet" href="archivo.css">
```

Eso hace que el navegador aplique ese CSS al HTML.

## HTML explicado de forma comun

En casi todos los HTML:

- `<!DOCTYPE html>`: documento HTML moderno.
- `<html lang="es">`: idioma español.
- `<head>`: configuracion invisible de la pagina.
- `<meta charset="UTF-8">`: tildes y caracteres especiales.
- `<meta name="viewport">`: responsive en movil.
- `<title>`: titulo de pestaña.
- `<link rel="icon">`: icono de la pestaña.
- `<link rel="stylesheet">`: conecta CSS.
- `<body>`: contenido visible.
- `<header>`: cabecera.
- `<nav>`: navegacion.
- `<main>`: contenido principal.
- `<section>`: bloque de contenido.
- `<script src="...">`: conecta JavaScript.

## JavaScript explicado de forma comun

En el frontend se usa JavaScript para:

- leer campos del HTML.
- escuchar clicks o escritura.
- crear HTML dinamico.
- llamar al backend con `fetch`.
- guardar datos en `localStorage`.
- guardar archivos en `IndexedDB`.
- redirigir con `window.location.href`.

## Que decir en una exposicion

Puedes explicarlo asi:

"Mi proyecto esta dividido en frontend y backend. El frontend esta en `src/main/webapp` y contiene las paginas HTML, sus estilos CSS y sus scripts JS. El backend esta en Java, dentro de `src/main/java`, y se encarga del login, registro, recuperacion y seguridad. Cuando alguien entra a la web, un filtro comprueba si tiene sesion. Si no, lo manda al login. Al iniciar sesion, el backend busca el usuario en MySQL y guarda su rol. Si el rol es ADMIN, puede entrar al administrador; si no, solo puede navegar por la parte normal. Los artistas se guardan en un archivo comun llamado `artist-store.js`, y el administrador permite editar esos datos desde formularios."

## Rutas clave para aprender

- Login visual: `src/main/webapp/login/login.html`
- Login JS: `src/main/webapp/login/login.js`
- Login Java: `src/main/java/com/ejemplo/controller/AuthLoginController.java`
- Validar usuario: `src/main/java/com/ejemplo/model/UsuarioLoginModel.java`
- Proteger toda la web: `src/main/java/com/ejemplo/controller/LoginFilter.java`
- Proteger admin: `src/main/java/com/ejemplo/controller/AdminFilter.java`
- Datos de artistas: `src/main/webapp/artistas/artist-store.js`
- Administrador: `src/main/webapp/administrador/administrador.js`
- Explorar: `src/main/webapp/explorar/explorar.js`
- Fichas: `src/main/webapp/artistas/ficha/ficha-artista.js`
