# seminuevos-backend

API REST y servidor de tiempo real del panel ChatControl.

## Requisitos

- Node.js 20 o superior
- PostgreSQL 14 o superior, con el trigger que emite `NOTIFY new_message`

## Puesta en marcha

```bash
npm install
cp .env.example .env    # y rellenar los valores
npm run dev
```

El arranque valida la configuración y falla de inmediato si falta algo
obligatorio (`JWT_SECRET`, conexión a la base, `CORS_ORIGINS` en producción).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo con recarga automática (nodemon) |
| `npm start` | Producción |
| `npm run lint` | Linting **y verificación de las reglas de capas** |

## Estructura

```
src/
├── config/         entorno, pool de PostgreSQL, listener LISTEN/NOTIFY
├── routes/         montaje de rutas, autenticación y validación
├── controllers/    traducción HTTP ↔ dominio
├── services/       reglas de negocio
├── repositories/   SQL y llamadas a APIs externas
├── middlewares/    auth, roles, validación, rate limit, errores
├── jobs/           tareas programadas
├── validators/     esquemas Zod
├── utils/          ApiError, ApiResponse, jwt, paginación, scoring
├── app.js          ensamblado de la app HTTP (sin efectos secundarios)
└── server.js       composition root: arranque y apagado ordenados
```

## Contrato de la API

Todas las respuestas comparten forma:

```jsonc
// éxito
{ "ok": true, "data": ..., "meta": { "page": 1, "pageSize": 20, "total": 84 } }

// error
{ "ok": false, "message": "Cita no encontrada", "details": null }
```

`meta` sólo aparece en los endpoints paginados. En un 400 de validación,
`details` trae la lista de campos que fallaron.

### Autenticación

Todo `/api` exige `Authorization: Bearer <token>` salvo `POST /api/users/login`.
Los WebSockets usan el mismo token en el handshake:

```js
io(URL, { auth: { token } })
```

### Rutas

| Prefijo | Acceso |
|---|---|
| `/api/users/login` | Público, con rate limit estricto |
| `/api/users` | Autenticado; crear, editar y borrar sólo `admin`/`super_admin` |
| `/api/customers`, `/api/conversations`, `/api/messages` | Autenticado |
| `/api/appointments`, `/api/slots`, `/api/answers` | Autenticado |
| `/api/assignments` | Autenticado; crear y borrar sólo `admin`/`super_admin` |
| `/api/contents` | Autenticado; editar sólo `admin`/`super_admin` |
| `/api/whatsapp/send` | Autenticado |
| `/api/reports` | Sólo `admin`/`super_admin` |
| `/health` | Público, para el orquestador |

## Despliegue con varias réplicas

Dos avisos antes de escalar horizontalmente:

1. **El job de seguimiento manda WhatsApps reales.** Debe quedar activo en una
   sola instancia: `FOLLOWUP_ENABLED=false` en las demás.
2. **Socket.IO necesita un adaptador compartido** (Redis) para que un evento
   llegue a los clientes conectados a otra réplica.
