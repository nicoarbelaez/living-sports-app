# Living Sport - Aplicación móvil (Expo)

**Living Sport** es una red social fitness: usuarios publican en un feed cómo se sienten, comparten rutinas, crean grupos y compiten en ejercicios. Cada semana se genera un podio con puntos canjeables por recompensas.

## Estado del repositorio

> [!IMPORTANT]
> La rama principal de desarrollo es **`develop`** (ya creada). No hagas cambios directamente en `main` ni en `develop`, crea ramas desde `develop` para nuevas funcionalidades.

> [!NOTE]
> `package.json` contiene scripts útiles (`start`, `android`, `ios`, `web`, `lint`) y dependencias clave para arrancar el proyecto localmente. Revisa dicho archivo antes de levantar el entorno.

## Estructura recomendada (breve)

```bash

/app               # rutas y pantallas (file-based routing)
/components        # componentes reutilizables
/providers         # context / providers (auth, theme, supabase, etc.)
/hooks             # hooks personalizados
/assets            # imágenes y recursos
/constants         # constantes de la app (colores, tamaños, rutas)
/scripts           # scripts de utilidad (reset, migraciones locales)

```

> [!TIP]
> Mantén los componentes atómicos y documenta la API de cada componente con JSDoc/TSDoc para acelerar revisiones.

## Mockups / diseño

Los mockups y wireframes están en
https://excalidraw.com/#room=fe51052756dd08f952e2,81v6_zqcd2q7A4Hs4ywT_A

> [!NOTE]
> En ese lienzo están los flujos UI y los wireframes para feed, perfil, creación de grupos y flujo de competición.

## Flujo de trabajo (resumen)

1. **Base**: parte siempre de `develop`.
2. **Ramas**:
   - `feature/<descripcion>` → nuevas funcionalidades.
   - `hotfix/<descripcion>` → correcciones urgentes.
   - `chore/<descripcion>` → mantenimiento/no funcional.
   - `docs/<descripcion>` → documentación.
3. **Commits**: atómicos, con prefijo (ver sección “Convenciones de commit” abajo).
4. **Push**: `git push origin feature/<descripcion>`
5. **Pull Request**: crea PR hacia `develop`. Incluye descripción, pasos para probar y screenshots si aplica. Asigna al menos 1 revisor.
6. **Merge**: después de la aprobación; preferido: **Squash Merge** para mantener historial limpio.

> [!IMPORTANT]
> No trabajar directamente en `develop` ni en `main`. Siempre crea una rama nueva desde `develop`.

## Convenciones de commits (escritura de commits)

Formato recomendado:

```

<tipo>(alcance opcional): descripción breve en inglés

```

**Tipos permitidos y significado:**

- `feat`: nueva funcionalidad para el usuario.
- `fix`: corrección de bug que afecta al usuario.
- `perf`: cambios que mejoran el rendimiento.
- `build`: cambios en build/despliegue o dependencias.
- `ci`: cambios en pipelines o CI.
- `docs`: cambios en la documentación.
- `refactor`: refactor sin cambio de comportamiento.
- `style`: cambios de formato, tabulaciones, espacios; no afectan funcionalidad.
- `test`: añadir o modificar tests.

Ejemplos:

```

feat(auth): add Google sign-in
fix(feed): correct post timestamp
chore(deps): update expo to ~54.0.33

```

> [!NOTE]
> Mensajes de commit en **inglés** (consistencia) y descriptivos. Evita mensajes vagos como `fix` o `update` sin contexto.

## Cómo empezar - guía rápida (entorno de pruebas con Expo)

> [!IMPORTANT]
> Antes de ejecutar: añade un `.env` con las variables requeridas (p. ej. `SUPABASE_URL`, `SUPABASE_ANON_KEY`) y no subas claves al repositorio.

1. Clona y cambia a `develop`:

```bash
git clone https://github.com/nicoarbelaez/living-sports-app.git
cd living-sports-app
git checkout develop
git pull origin develop
```

2. Instala dependencias:

```bash
npm install
```

3. Crea `.env` (ejemplo):

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

> [!CAUTION]
> Nunca incluyas las keys reales en commits públicos. Usa `.gitignore` para excluir `.env`.

4. Inicia Expo:

```bash
npx expo start
```

5. Atajos en la terminal de Expo:

- `a` → abrir en emulador Android
- `i` → abrir en simulador iOS (macOS)
- `w` → abrir en web

6. Scripts útiles (desde `package.json`):

```bash
npm run start        # expo start
npm run android      # expo start --android
npm run ios          # expo start --ios
npm run web          # expo start --web
npm run lint         # ejecutar linter
```

## Pruebas y lint

```bash
npm run lint
# npm test  (si se configura suite de tests)
```

> [!TIP]
> Configura pre-commit hooks (husky) para ejecutar `npm run lint` y tests básicos antes de hacer push.

## Contribuyendo / Enlaces rápidos

- Archivo de contribución: `CONTRIBUTING.md` (contiene flujo Git detallado y convención de commits).
- Mockups: [https://excalidraw.com/#room=fe51052756dd08f952e2,81v6_zqcd2q7A4Hs4ywT_A](https://excalidraw.com/#room=fe51052756dd08f952e2,81v6_zqcd2q7A4Hs4ywT_A)
- Repositorio: GitHub.

## Notas finales

> [!WARNING]
> Si vas a ejecutar pruebas en un emulador, asegúrate de tener las versiones de SDK nativas compatibles con `expo` indicado en `package.json`.

> [!TIP]
> Documenta en este README las rutas principales dentro de `app/` (por ejemplo: `app/(auth)/login.tsx`, `app/feed/index.tsx`) para que nuevos colaboradores arranquen más rápido.
