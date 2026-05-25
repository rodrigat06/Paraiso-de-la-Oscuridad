# 03 - Plan de simplificacion

Objetivo: que el proyecto sea facil de entender, con carpetas limpias, nombres simples y archivos mas pequenos.

## Importante

No conviene hacerlo todo de golpe. Hay 98 HTML y miles de enlaces internos. Si se renombran todos a la vez, es facil romper media web.

La limpieza correcta se hace por fases.

## Fase 1 - Entender y documentar

Estado: empezada.

Se crea esta documentacion:

- `docs/01-mapa-del-proyecto.md`
- `docs/02-como-se-conecta-todo.md`
- `docs/03-plan-de-simplificacion.md`

Tambien se detectan duplicados claros:

| Duplicado | Que hacer |
| --- | --- |
| `Menú.css` y `paginas/menu/menu.css` | Hecho: queda `Menú.css` |
| `Menú.js` y `paginas/menu/menu.js` | Hecho: queda `Menú.js` |
| `Artista Personalizado.css` y `paginas/artista-personalizado/Artista Personalizado.css` | Dejar solo uno |
| `Artista Personalizado.js` y `paginas/artista-personalizado/Artista Personalizado.js` | Dejar solo uno |
| `Assets/js/catalogo-canciones.js` y `recursos/shared/js/catalogo-canciones.js` | Hecho: queda `Assets/js/catalogo-canciones.js` |
| `Assets/js/register.js` y `recursos/shared/js/register.js` | Hecho: queda `Assets/js/register.js` |

## Fase 2 - Nombres simples

Renombrar carpetas con nombres faciles:

```text
Inicio de Sesion        -> pages/auth
Registrarse             -> pages/auth
contraseña olvidada     -> pages/auth
Jazmin Bean             -> pages/artists/jazmin
Melanie Martinez        -> pages/artists/melanie
significados-canciones  -> pages/meanings
```

Regla: mantener redirecciones desde las rutas antiguas durante un tiempo.

## Fase 3 - CSS pequeno

Ahora hay CSS muy largo. Lo ideal es separar asi:

```text
assets/css/
├── base.css          Reset, tipografias y colores.
├── layout.css        Cabecera, botones, grid y responsive comun.
├── auth.css          Login, registro y recuperar password.
├── menu.css          Menu principal.
├── artist.css        Paginas de artistas.
├── albums.css        Albumes, EPs y singles.
├── meanings.css      Significados de canciones.
└── admin.css         Panel administrador.
```

Cada archivo debe hacer una sola cosa.

## Fase 4 - JS pequeno

Ahora algunos JS mezclan muchas responsabilidades. Lo ideal:

```text
assets/js/
├── api.js            Llamadas fetch al servidor.
├── auth.js           Login, registro y recuperar password.
├── storage.js        Guardar y leer estado.
├── navigation.js     Botones volver, menu y enlaces.
├── user.js           Perfil, sesion y logout.
├── artist.js         Artistas personalizados.
├── player.js         Audio y controles.
└── admin.js          Panel administrador.
```

Cada funcion debe tener nombre claro y comentario corto.

## Fase 5 - HTML repetido

Muchas paginas repiten:

- Menu superior.
- Boton volver.
- Boton ayuda.
- Perfil.
- Footer.

Eso deberia generarse con JS compartido o con plantillas simples.

Ejemplo ideal:

```html
<div data-header></div>
<main>
  contenido de la pagina
</main>
<div data-footer></div>
```

Y un JS comun rellena header/footer.

## Fase 6 - Comentarios utiles

No hay que comentar cada linea como si fuese un diccionario. Eso vuelve el codigo mas pesado.

La regla buena:

- Comentario arriba de cada archivo explicando que hace.
- Comentario arriba de cada bloque importante.
- Nombres de funciones muy claros.
- Nada de comentarios obvios tipo "sumar suma".

Ejemplo bueno:

```js
// Inicia sesion llamando al servidor y guarda el usuario si todo va bien.
async function iniciarSesion(email, password) {
  ...
}
```

Ejemplo malo:

```js
// Crea una constante llamada email.
const email = ...
```

## Fase 7 - Pruebas

Despues de cada fase hay que comprobar:

- Home.
- Login.
- Registro.
- Menu.
- Una pagina de Jazmin.
- Una pagina de Melanie.
- Una pagina de significado.
- Admin.
- Movil, tablet y ordenador.

Si una fase rompe algo, se arregla antes de pasar a la siguiente.
