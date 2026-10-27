# FoodFind — Backend

API REST de FoodFind: locales gastronómicos ficticios, sus comidas organizadas por categoría (Hamburguesas, Pizzas, Lomos, Milanesas) y las puntuaciones de los usuarios, con el promedio de cada comida y de cada local.

Hecha con Node.js, Express 5, TypeScript y MongoDB (Mongoose). Parte de la base del repositorio [puntuaciones-comidas](https://github.com/MariaCeciliaRomero/puntuaciones-comidas), con los cambios acordados en la revisión del grupo.

## Tecnologías

- Node.js 20 o superior y npm
- Express 5
- TypeScript (se ejecuta en desarrollo con tsx)
- MongoDB + Mongoose
- JSON Web Token (JWT) y bcrypt
- dotenv y cors

## Cambios respecto del repositorio inicial

- Pasado a TypeScript y separado en `app.ts` (configuración de Express) y `server.ts` (conexión y arranque).
- Nuevo modelo **Categoria**; cada comida pertenece a un local y a una categoría.
- Los locales suman WhatsApp, Instagram y una **portada** (la única imagen del sistema).
- **Rol de usuario** (`usuario` o `admin`): solo un admin crea, edita y borra categorías, locales y comidas.
- Al crear o editar una comida se comprueba que el local y la categoría existan.
- Puntuaciones de **0,5 a 5 en pasos de 0,5** (como el selector del wireframe) y comentario obligatorio (10 a 500 caracteres). Sigue habiendo **una sola puntuación por usuario y comida**.
- **cors** activado y un **middleware de errores** único: los controladores ya no repiten try/catch.
- Rutas para la pantalla: detalle de local, filtros por categoría, categorías y comidas de un local, reseñas de un local, promedios y comida "más elegida". Los listados de puntuaciones están paginados.
- **Script de datos de prueba** (`npm run seed`) con locales ficticios.

## Estructura

```text
src/
├── app.ts              crea la app de Express: middlewares y rutas
├── server.ts           conecta a MongoDB y levanta el servidor
├── config/             variables de entorno y conexión a la base
├── models/             esquemas de Mongoose (Categoria, Local, Comida, Usuario, Puntuacion)
├── controllers/        reciben el pedido y arman la respuesta
├── routes/             un archivo de rutas por recurso
├── services/           lógica de puntajes (promedios y comida destacada)
├── middlewares/        token, roles, validación de IDs y errores
├── utils/              validaciones, paginación y errores HTTP
├── types/              tipos de TypeScript
└── scripts/seed.ts     carga de datos ficticios
```

## Instalación

1. Clonar el repositorio y entrar a la carpeta:

   ```bash
   git clone https://github.com/VirgiSalinas/FoodFind.git
   cd FoodFind
   ```

2. Cambiarse a la rama de trabajo del grupo:

   ```bash
   git switch develop
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

4. Crear el archivo `.env` copiando `.env.example` y completar los valores. Para generar un `JWT_SECRET` aleatorio:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   El `.env` nunca se sube a GitHub.

5. Tener MongoDB funcionando (local o en MongoDB Atlas) y cargar los datos de prueba:

   ```bash
   npm run seed
   ```

6. Levantar el servidor:

   ```bash
   npm run dev
   ```

   La API queda en `http://localhost:3000`. Para comprobarla: `GET /api/salud`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor en modo desarrollo, se reinicia solo al guardar |
| `npm run seed` | Borra la base y carga los datos ficticios |
| `npm run typecheck` | Revisa los tipos de TypeScript sin compilar |
| `npm run build` | Compila a JavaScript en `dist/` |
| `npm start` | Ejecuta la versión compilada |

## Datos de prueba

`npm run seed` carga 4 categorías, 6 locales ficticios, 18 comidas, 7 usuarios y varias puntuaciones. **Borra todo lo que haya en la base antes de cargar.**

| Usuario | Rol |
|---|---|
| admin@foodfind.test | admin |
| micaela@foodfind.test, mateo@foodfind.test, florencia@foodfind.test, lucas@foodfind.test, sofia@foodfind.test, tomas@foodfind.test | usuario |

Contraseña de todos: `Prueba1234` (solo para desarrollo).

## Endpoints

Las rutas marcadas con **token** necesitan el header `Authorization: Bearer TOKEN`, que se obtiene en el login. Las marcadas con **admin** necesitan además un usuario con rol admin.

### Categorías

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/categorias` | Listar categorías | Público |
| GET | `/api/categorias/:id` | Ver una categoría | Público |
| POST | `/api/categorias` | Crear categoría | admin |
| PUT | `/api/categorias/:id` | Editar categoría | admin |
| DELETE | `/api/categorias/:id` | Borrar categoría (si no tiene comidas) | admin |

### Locales

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/locales?categoria=ID` | Listar locales con su puntaje; con `categoria`, solo los que tienen comidas de esa categoría | Público |
| GET | `/api/locales/:id` | Detalle del local con promedio y cantidad de puntuaciones | Público |
| GET | `/api/locales/:id/puntaje` | Promedio y cantidad de puntuaciones del local | Público |
| GET | `/api/locales/:id/categorias` | Categorías que ofrece el local (desplegable "Tipo de comida") | Público |
| GET | `/api/locales/:id/comidas?categoria=ID` | Comidas del local (desplegable "Plato específico") | Público |
| GET | `/api/locales/:id/destacada?categoria=ID` | Comida "más elegida" del local | Público |
| GET | `/api/locales/:id/puntuaciones?pagina=1&limite=10` | Reseñas de todas las comidas del local | Público |
| POST | `/api/locales` | Crear local | admin |
| PUT | `/api/locales/:id` | Editar local | admin |
| DELETE | `/api/locales/:id` | Borrar local con sus comidas y puntuaciones | admin |

### Comidas

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/comidas?local=ID&categoria=ID` | Listar comidas con su puntaje, con filtros opcionales | Público |
| GET | `/api/comidas/:id` | Detalle de una comida con su puntaje | Público |
| GET | `/api/comidas/:id/puntaje` | Promedio y cantidad de puntuaciones | Público |
| GET | `/api/comidas/:id/puntuaciones?pagina=1&limite=10` | Reseñas de la comida | Público |
| POST | `/api/comidas` | Crear comida (local y categoría obligatorios) | admin |
| PUT | `/api/comidas/:id` | Editar comida | admin |
| DELETE | `/api/comidas/:id` | Borrar comida con sus puntuaciones | admin |

### Usuarios

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/usuarios/registro` | Registrarse (siempre con rol usuario) | Público |
| POST | `/api/usuarios/login` | Iniciar sesión y obtener el token | Público |
| GET | `/api/usuarios/perfil` | Datos del usuario logueado | token |

### Puntuaciones

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/puntuaciones?comida=ID&usuario=ID&pagina=1&limite=10` | Listar puntuaciones | Público |
| GET | `/api/puntuaciones/mia?comida=ID` | La puntuación propia de una comida, para mostrar "Editar" | token |
| POST | `/api/puntuaciones` | Puntuar una comida (una sola vez) | token |
| PUT | `/api/puntuaciones/:id` | Editar la puntuación propia | token, autor |
| DELETE | `/api/puntuaciones/:id` | Borrar una puntuación | token, autor o admin |

Ejemplo de cuerpo para puntuar:

```json
{
  "comida": "ID_DE_LA_COMIDA",
  "valor": 4.5,
  "comentario": "Muy rica, volvería a pedirla"
}
```

El usuario se toma del token, nunca del cuerpo del pedido. Si el usuario ya puntuó esa comida, la API responde 409 y puede editar su puntuación con PUT.

## Respuestas de error

Todas las respuestas de error tienen la forma `{ "mensaje": "..." }`.

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos, ID mal formado o JSON mal escrito |
| 401 | Sin token o token inválido |
| 403 | Sin permiso (no es admin, o no es el autor) |
| 404 | No existe el recurso o la ruta |
| 409 | Dato duplicado (email registrado o segunda puntuación de la misma comida) |
| 500 | Error del servidor |

## Cómo trabajamos con Git

- `main`: versión entregable. Solo recibe `develop` cuando el grupo decide hacer una entrega.
- `develop`: integración del grupo. Es la rama por defecto y la base de todas las ramas nuevas.
- Cada tarea en su rama (`feature/...`, `fix/...`, `docs/...`) y entra a `develop` con un Pull Request revisado por otra persona.

Nadie sube cambios directo a `main` ni a `develop`.

## Estado

Backend en desarrollo: es la base para que el grupo siga trabajando.
