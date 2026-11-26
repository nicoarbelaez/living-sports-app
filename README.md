# Living Sport

[English](./README.en.md) · Español

Red social fitness para Android hecha con Expo y Supabase. Los usuarios publican en un feed, forman comunidades y compiten en ejercicios enviando un video como evidencia, que la propia comunidad valida por votación. Si la evidencia se aprueba, se convierte en un récord personal verificado.

Proyecto en equipo. Nicolas Arbelaez creó el repositorio y la base técnica; [@SebasHDV](https://github.com/SebasHDV) y [@brayan200j-collab](https://github.com/brayan200j-collab) también contribuyen. Esta documentación describe la rama `develop`.

## Funcionalidades

- Inicio de sesión con Google (Supabase Auth); la sesión se guarda en SecureStore.
- Feed con publicaciones con imágenes o video, likes y comentarios.
- Comunidades: crear, ver detalle, comunidades destacadas y ranking.
- Competencias por ejercicio con evidencia en video, validación por votos de la comunidad (aprobación o rechazo automático a partir de 3 votos con mayoría), ranking y podio.
- Perfil editable. El esquema de base de datos también modela seguidores, historial corporal y récords personales; los récords verificados los crea la validación de competencias.
- Notificaciones dentro de la app.
- Rutinas por día de la semana.

### Roadmap (en desarrollo)

- Rutinas generadas con IA: hoy la pantalla `app/routine/ai-routine.tsx` es un marcador ("En desarrollo"). Existe un prototipo de función Edge con Gemini solo en la rama `feature/ai-routines`, sin integrar.
- Podio semanal con puntos canjeables por recompensas: no está implementado.

## Stack

| Capa | Tecnología |
| --- | --- |
| App | Expo ~54.0.34, React Native 0.81.5, React 19.1.0, TypeScript ~5.9.2 |
| Navegación | Expo Router ~6.0.23 |
| Estilos | NativeWind ^5.0.0-preview.3, Tailwind CSS ^4.2.2, class-variance-authority |
| Estado | Zustand ^5.0.12, react-native-mmkv ^4.3.1 |
| Formularios | React Hook Form ^7.72.1, Zod ^4.3.6 |
| UI y animación | Reanimated ~4.1.1, Moti ^0.30.0, FlashList 2.0.2, @gorhom/bottom-sheet ^5.2.9 |
| Backend | Supabase (PostgreSQL con RLS y triggers de auditoría, Auth, Realtime, Edge Functions en Deno), @supabase/supabase-js ^2.99.1 |
| Media | Cloudinary (subida desde las funciones Edge) |
| Calidad y entrega | ESLint ^9.25.0, Prettier ^3.8.1, Husky ^9.1.7, lint-staged, semantic-release ^24.2.5, GitHub Actions, EAS Build |

## Requisitos

- Node.js 22 y npm (el repositorio usa `package-lock.json`; solo npm).
- Android Studio con un emulador, o un dispositivo Android. La app solo apunta a Android.
- Un proyecto de Supabase y una cuenta de Cloudinary con un upload preset.
- Supabase CLI si vas a aplicar migraciones o desplegar funciones.

## Puesta en marcha

```bash
git clone https://github.com/nicoarbelaez/living-sports-app.git
cd living-sports-app
git checkout develop
npm install
cp .env.example .env.local
```

Variables de `.env.local` (ver `.env.example`):

| Variable | Descripción |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública |
| `PROJECT_REF` | ID del proyecto, usado por `npm run update-types` |

Las funciones Edge leen `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_UPLOAD_PRESET` como secretos de Supabase:

```bash
supabase secrets set CLOUDINARY_CLOUD_NAME=... CLOUDINARY_UPLOAD_PRESET=...
```

Base de datos y funciones:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
supabase functions deploy create-post create-group create-competition submit-evidence
```

Para iniciar la app:

```bash
npm run android      # Metro y emulador o dispositivo Android
# o
npm run start        # abre el menú de Expo; pulsa "a" para Android
```

Nunca subas claves reales al repositorio: `.env` y `.env*.local` están en `.gitignore`.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run start` | `expo start` |
| `npm run android` | `expo start -c --android` |
| `npm run lint` | ESLint sobre `app`, `components`, `providers`, `hooks`, `lib`, `constants` |
| `npm run format` | Prettier con el plugin de Tailwind |
| `npm run update-types` | Regenera los tipos de la base de datos con `PROJECT_REF` |
| `npm run semantic:dry` | Simula un release con semantic-release |

## Estructura

```text
app/                 rutas de Expo Router: (auth), (tabs), community, competition, routine
features/            dominios: communities, competitions, feed, notifications, profile
components/          UI reutilizable (feed, competition, community, ui)
providers/           AuthProvider, tema, scroll
stores/ hooks/ lib/  estado, hooks y utilidades (cliente Supabase, MMKV)
supabase/
  migrations/        esquema, RLS, auditoría, catálogos
  functions/         create-post, create-group, create-competition, submit-evidence, _shared
  tests/             pruebas SQL 001 a 009
```

`develop` está migrando de carpetas planas (`stores/`, `hooks/`, `components/`) a carpetas por dominio en `features/`, así que ambas estructuras conviven.

Arquitectura con diagramas: [docs/architecture.md](./docs/architecture.md).

## Pruebas, CI y releases

- Pruebas SQL de esquema, RLS y triggers en `supabase/tests/` y pruebas Deno de las utilidades de las funciones Edge. No hay suite de pruebas de JavaScript.
- `PR Check` (`.github/workflows/preview.yml`) corre `expo-doctor`, lint y una comprobación de build de Android en cada pull request.
- `Production Release` (`.github/workflows/main-build.yml`) corre semantic-release y build en cada push a `main`.
- Perfiles de EAS en `eas.json`: `development`, `preview` (APK) y `production` (APK).

## Contribuir

Parte siempre de `develop`, trabaja en una rama `feature/`, `hotfix/`, `chore/` o `docs/` y abre el pull request hacia `develop` con squash merge. El flujo completo, los tipos de commit y los nombres de rama están en [CONTRIBUTING.md](./CONTRIBUTING.md). Los mockups están en [Excalidraw](https://excalidraw.com/#room=fe51052756dd08f952e2,81v6_zqcd2q7A4Hs4ywT_A).

## Licencia

Ver [LICENSE](./LICENSE).
