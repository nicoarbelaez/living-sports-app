# Comandos

```bash
npm run start        # Nunca usar
npm run android      # Ejecuta en Android
npm run lint         # ESLint
npm run format       # Prettier (con Tailwind plugin)
npm run update-types # Actualiza los tipos de la DB de Supabase
```

* No hay framework de testing configurado.
* Husky ejecuta ESLint y Prettier automáticamente en archivos staged (lint-staged).
* **Solo usar npm.**

# Entorno

El entorno está definido en `.env.local`.
Consulta ese archivo para ver las variables disponibles.

# Stack

* React Native (Expo)
* Expo Router
* NativeWind V5 (Tailwind CSS)
* Supabase (PostgreSQL, Auth, Realtime, Storage)
* Cloudinary (media)
* Class Variance Authority (CVA)
* Moti (animaciones)

La app funciona únicamente para **Android**.

# Arquitectura

**Living Sports** es MVP de una red social de fitness donde los usuarios:

* Publican entrenamientos
* Comparten rutinas
* Se unen a grupos
* Compiten


# Estructura del proyecto

| Ruta                          | Propósito                           |
| ----------------------------- | ----------------------------------- |
| `app/`                        | Rutas (Expo Router)                 |
| `app/_layout.tsx`             | Layout raíz, control de sesión      |
| `app/(auth)/`                 | Login / registro                    |
| `app/(tabs)/`                 | App principal                       |
| `components/`                 | Componentes reutilizables           |
| `components/ui/`              | Componentes base                    |
| `providers/`                  | Context providers                   |
| `hooks/`                      | Hooks personalizados                |
| `lib/supabase.ts`             | Cliente Supabase                    |
| `constants/theme.ts`          | Tema                                |
| `supabase/migrations/`        | Migraciones                         |
| `supabase/functions/`         | Edge Functions                      |
| `supabase/functions/_shared/` | Código reutilizable entre funciones |

# Reglas generales (MUY IMPORTANTE)

* **Nunca hacer commits si no se solicita explícitamente.**
* Mantener código limpio, modular y consistente.
* Evitar duplicación de lógica.
* Priorizar claridad sobre “magia”.
* Mantener separación clara entre frontend, backend y lógica de negocio.

# Reglas de lógica de negocio

## Cuándo usar Edge Functions

Usar Edge Functions cuando:

* Hay lógica compleja
* Hay múltiples operaciones (ej: inserts + validaciones + side effects)
* Se requiere consistencia (reglas de negocio, transacciones)
* Se generan eventos (ej: notificaciones)

Ejemplos:

* Crear un post con media + relaciones
* Sistema de notificaciones
* Procesos que afectan múltiples tablas

👉 Cloudinary y otros sistemas externos también deben orquestarse desde aquí cuando haya lógica compleja.

## Cuándo usar `_shared`

Usar `supabase/functions/_shared/` cuando:

* Hay lógica repetitiva
* Se necesitan helpers reutilizables
* Validaciones comunes
* Servicios compartidos (ej: notification service)

## Cuándo NO usar Edge Functions

NO usar Edge Functions si solo haces una operación simple:

```ts
supabase.from("tabla").insert(...)
```

Si es una sola operación → usar directamente desde el cliente.

# Autenticación

* `AuthProvider` maneja la sesión de Supabase
* `_layout.tsx` redirige a `/login` si no hay sesión
* Las sesiones se almacenan en Secure Store


# Base de datos

Las migraciones en `supabase/migrations/` se ejecutan en orden y definen:

* Usuarios
* Sistema de follows
* Rutinas y ejercicios
* Feed social (posts, media, likes, comentarios)
* Grupos y competencias

Todo protegido con RLS.

# Estilos

* NativeWind (Tailwind en React Native)
* CVA para variantes de componentes


# Git Workflow

* Branch base: `develop`

### Naming:

* `feature/...`
* `fix/...`
* `chore/...`
* `docs/...`

### Convención de commits:

* `feat:`
* `fix:`
* `refactor:`
* `style:`
* `perf:`

Nunca hacer commits automáticamente.

# CI/CD

Workflows en `.github/workflows/`:

* `develop` → prerelease
* `main` → release + build Android
* Linter en cada push


# Nota arquitectónica clave

El sistema debe seguir un enfoque:

```text
evento → lógica → persistencia → efectos secundarios
```

Ejemplo:

```text
like → edge function → guardar → notificar
```

No mezclar lógica de negocio en el frontend.

