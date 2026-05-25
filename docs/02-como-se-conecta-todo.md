# 02 - Como se conecta todo

Piensa en la web como una cadena.

```text
HTML -> CSS -> JavaScript -> Java Servlet -> MySQL -> Railway
```

## HTML

El HTML es el esqueleto de una pagina.

Ejemplo:

```html
<link rel="stylesheet" href="Assets/css/responsive-fix.css">
<script src="Assets/js/sql-storage.js"></script>
```

Esto significa:

- El HTML carga un archivo CSS para verse bonito.
- El HTML carga un archivo JS para tener comportamiento.

## CSS

El CSS decide como se ve todo:

- Colores.
- Tamano.
- Separaciones.
- Responsive para movil, tablet y ordenador.

Archivo clave ahora mismo:

```text
src/main/webapp/Assets/css/responsive-fix.css
```

Ese archivo es una capa de seguridad visual. Sirve para evitar que las paginas se salgan de la pantalla en movil.

## JavaScript

El JavaScript hace que la pagina reaccione.

Ejemplos:

- Login.
- Registro.
- Guardar favoritos.
- Leer datos del usuario.
- Llamar al servidor.
- Cargar CSS compartido.

Archivo importante:

```text
src/main/webapp/Assets/js/sql-storage.js
```

Ese archivo guarda y recupera estado de la web usando el servidor cuando puede. Si el servidor falla, intenta no romper la pagina.

## Java Servlet

Los servlets son entradas del servidor.

Cuando JavaScript hace esto:

```js
fetch("/auth/login")
```

esta llamando a este controlador:

```text
src/main/java/com/ejemplo/controller/AuthLoginController.java
```

## Controladores Java

| Ruta web | Archivo Java | Para que sirve |
| --- | --- | --- |
| `/auth/login` | `AuthLoginController.java` | Iniciar sesion |
| `/auth/register` | `AuthRegisterController.java` | Registrar usuario |
| `/auth/recover/check` | `AuthRecoverController.java` | Comprobar recuperacion |
| `/auth/recover/reset` | `AuthRecoverController.java` | Cambiar password |
| `/api/*` | `PublicDataController.java` | Guardar/leer datos publicos de la app |
| `/api/media` | `PublicDataController.java` + `MediaModel.java` | Subir/leer archivos guardados |
| `/admin/*` | `AdminController.java` | Panel admin |
| `/admin/bloquear` | `BloquearUsuarioController.java` | Bloquear usuario |
| `/admin/desbloquear` | `DesbloquearUsuarioController.java` | Desbloquear usuario |
| `/admin/listarUsuarios` | `ListarUsuariosController.java` | Ver usuarios |
| `/admin/listarBloqueados` | `ListarBloqueadosController.java` | Ver bloqueados |
| `/admin/advertirUsuario` | `AdvertirUsuarioController.java` | Mandar advertencia |

## Modelos Java

Los modelos son las clases que hablan con MySQL.

| Archivo | Para que sirve |
| --- | --- |
| `ConexionBD.java` | Abre la conexion con MySQL usando variables de Railway |
| `SchemaModel.java` | Crea tablas si faltan |
| `UsuarioLoginModel.java` | Busca usuarios para login |
| `UsuarioRegisterModel.java` | Crea usuarios |
| `UsuarioRecoveryModel.java` | Recupera/cambia password |
| `AdminModel.java` | Reservas, ayuda, resenas y datos del admin |
| `AppStateModel.java` | Guarda estado general en `app_estado` |
| `MediaModel.java` | Guarda archivos en `app_media` |
| `BloqueoUsuarioModel.java` | Bloquea/desbloquea usuarios |

## MySQL

El SQL inicial esta aqui:

```text
mysql/init/01-bd1.sql
```

Tablas principales:

| Tabla | Que guarda |
| --- | --- |
| `usuarios` | Usuarios, password, rol y bloqueo |
| `ayuda` | Mensajes de ayuda/contacto |
| `resenas` | Comentarios y valoraciones |
| `usuarios_bloqueados` | Emails bloqueados |
| `usuarios_advertencias` | Advertencias |
| `reservas` | Reservas de actividades |
| `app_estado` | Estado JSON de la app |
| `app_media` | Archivos subidos |

## Railway

Railway hace tres cosas:

1. Construye la app usando el `Dockerfile`.
2. Arranca Tomcat/Jakarta.
3. Le da variables de MySQL a la app.

Variables importantes:

```text
MYSQLHOST
MYSQLPORT
MYSQLDATABASE
MYSQLUSER
MYSQLPASSWORD
MYSQL_URL
```

`ConexionBD.java` lee esas variables. Por eso la web puede conectarse a la base de datos en Railway.
