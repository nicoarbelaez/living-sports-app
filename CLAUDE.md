## Comandos

```bash
npm run start
npm run android
npm run lint
npm run format
npm run update-types
```

- No hay framework de testing configurado.
- Husky ejecuta ESLint y Prettier automáticamente en archivos staged (`lint-staged`).
- Solo usar `npm`.

## Entorno

El entorno está definido en `.env.local`.
Consultar ese archivo para ver las variables disponibles.
Si cambia una variable, actualizar también `.env.example`.

## Stack

- React Native (Expo)
- Expo Router
- NativeWind V5
- Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- Cloudinary
- CVA
- Moti

La app funciona únicamente para **Android**.

## Arquitectura

**Living Sports** es un MVP de red social fitness donde los usuarios:

- publican entrenamientos
- comparten rutinas
- se unen a grupos
- compiten

### Estructura del proyecto

La arquitectura debe organizarse por **responsabilidad** y no solo por tipo de archivo.

- `app/` = navegación y pantallas
- `features/` = lógica por dominio
- `components/ui/` = componentes base reutilizables
- `components/shared/` = componentes compuestos reutilizables
- `lib/` = clientes, helpers y utilidades técnicas
- `hooks/` = hooks globales
- `stores/` = estado global
- `types/` = tipos compartidos
- `supabase/` = migraciones y Edge Functions

### Cuándo crear una carpeta nueva

Se crea una carpeta nueva cuando un conjunto de archivos comparte una misma responsabilidad y empieza a crecer.

- Si una pantalla tiene formulario, validación, fetch y transformaciones, debe pasar a una feature.
- Si un componente base se reutiliza en varias partes, debe ir a `components/ui/`.
- Si una lógica depende de Supabase y de una regla de negocio, debe salir de la pantalla y pasar a `services` o a una Edge Function.

### Ejemplo de feature

Solo como referencia, una feature puede organizarse así:

```bash
features/communities/
├── components/
├── screens/
├── hooks/
├── services/
├── schemas/
├── types.ts
└── mappers.ts
```

### Qué va en cada carpeta

| Ruta                          | Propósito                                           |
| ----------------------------- | --------------------------------------------------- |
| `app/`                        | Rutas y composición de pantallas con Expo Router    |
| `features/`                   | Lógica y UI agrupada por dominio                    |
| `components/ui/`              | Botones, inputs, cards, modales y componentes base  |
| `components/shared/`          | Componentes reutilizables con más estructura        |
| `providers/`                  | Context providers globales                          |
| `hooks/`                      | Hooks globales que no pertenecen a una sola feature |
| `stores/`                     | Estado global o persistente                         |
| `lib/`                        | Supabase, helpers y utilidades técnicas    |
| `constants/`                  | Constantes de la app                                |
| `types/`                      | Tipos compartidos                                   |
| `supabase/migrations/`        | Migraciones, RLS, triggers y SQL                    |
| `supabase/functions/`         | Edge Functions                                      |
| `supabase/functions/_shared/` | Helpers reutilizables entre funciones               |

## Reglas generales

- Nunca hacer commits si no se solicita explícitamente.
- Mantener código limpio, modular y consistente.
- Evitar duplicación de lógica.
- Priorizar claridad sobre “magia”.
- Mantener separación clara entre frontend, backend y lógica de negocio.

## Reglas de lógica de negocio

### Cuándo usar Edge Functions

Usar Edge Functions cuando exista alguna de estas condiciones:

- lógica compleja
- múltiples operaciones en una misma acción
- validaciones críticas
- necesidad de consistencia entre tablas
- side effects como notificaciones o eventos externos

Ejemplos:

- crear un post con media y relaciones
- crear una comunidad con validaciones
- procesar una competencia
- notificar cambios relevantes

### Cuándo usar `_shared`

Usar `supabase/functions/_shared/` cuando exista lógica repetida entre funciones:

- validaciones comunes
- helpers reutilizables
- builders de respuestas
- manejo estándar de errores
- utilidades compartidas

### Cuándo no usar Edge Functions

No usarlas si solo se hace una operación simple:

```ts
supabase.from("tabla").insert(...)
```

Si es una sola operación, usar directamente el cliente.

## Autenticación

- `AuthProvider` maneja la sesión de Supabase.
- `app/_layout.tsx` protege las rutas según sesión.
- Las sesiones se almacenan en Secure Store.

## Base de datos

Las migraciones en `supabase/migrations/` se ejecutan en orden y definen:

- usuarios
- follows
- rutinas y ejercicios
- feed social
- grupos y competencias

Todo debe estar protegido con RLS.

## Estilos

- NativeWind para estilos
- CVA para variantes de componentes

### Tokens de diseño

Los tokens están definidos en `global.css` como variables CSS (`--primary`, `--secondary`, `--destructive`, `--muted`, `--border`, `--foreground`, etc.) y mapeados en `@theme inline` para que NativeWind los reconozca como clases Tailwind.

**Regla:** Nunca usar colores arbitrarios de Tailwind (`bg-blue-500`, `text-gray-900`, `border-gray-300`, etc.) en componentes base de `components/ui/`. Siempre usar los tokens del sistema:

| Token Tailwind              | Uso                                      |
| --------------------------- | ---------------------------------------- |
| `bg-primary`                | Acción principal                         |
| `text-primary-foreground`   | Texto sobre fondo primary                |
| `bg-secondary`              | Acción secundaria o superficie neutra    |
| `text-secondary-foreground` | Texto sobre fondo secondary              |
| `bg-destructive`            | Acción destructiva                       |
| `bg-muted`                  | Superficie apagada                       |
| `text-muted-foreground`     | Texto secundario o placeholder           |
| `bg-background`             | Fondo de la app                          |
| `text-foreground`           | Texto principal                          |
| `border-border`             | Bordes de inputs, cards y divisores      |
| `bg-accent`                 | Hover / estado activo                    |
| `text-accent-foreground`    | Texto sobre fondo accent                 |

Colores arbitrarios solo están permitidos cuando no existe un token equivalente y el valor es estrictamente presentacional (ej: color de un ícono SVG hardcodeado).

## Convenciones de nombres

### Archivos y carpetas

- Componentes: `PascalCase.tsx`
- Hooks: `useNombre.ts`
- Stores: `useNombreStore.ts`
- Screens: `NombreScreen.tsx`
- Services: `accionEntidad.ts`
- Schemas: `entidad.schema.ts`
- Mappers: `mapEntidad.ts`
- Tipos: `entidad.ts`

### Reglas de nombrado

- El nombre debe describir una sola responsabilidad.
- No usar nombres genéricos como `helper.ts`, `utils.ts` o `data.ts` si el archivo ya tiene un dominio claro.
- Si un archivo supera una responsabilidad principal, debe dividirse.
- Si un componente se reutiliza en más de una pantalla, debe salir de la screen y pasar a `components/`.

## Git Workflow

- Branch base: `develop`

### Naming

- `feature/...`
- `fix/...`
- `chore/...`
- `docs/...`

### Convención de commits

- `feat:`
- `fix:`
- `refactor:`
- `style:`
- `perf:`

Nunca hacer commits automáticamente.

## CI/CD

Workflows en `.github/workflows/`:

- `develop` → prerelease
- `main` → release + build Android
- linter en cada push

## Nota arquitectónica clave

El sistema debe seguir este flujo:

```text
evento → lógica → persistencia → efectos secundarios
```

Ejemplo:

```text
like → edge function → guardar → notificar
```

No mezclar lógica de negocio en el frontend.
