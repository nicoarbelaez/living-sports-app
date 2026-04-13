# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start       # Start Expo development server (press w/a/i for web/Android/iOS)
npm run android     # Run on Android emulator
npm run ios         # Run on iOS simulator
npm run web         # Run on web
npm run lint        # ESLint check
npm run format      # Prettier format (with Tailwind plugin)
```

No test framework is configured yet.

Husky runs ESLint and Prettier automatically on staged files via lint-staged.

## Environment

Requires a `.env.local` file with:
```
EXPO_PUBLIC_SUPABASE_URL=<url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<key>
```

## Architecture

**Living Sports** is a fitness social network — users post workouts, share routines, join groups, and compete. It's a React Native app (Expo) targeting iOS, Android, and Web.

**Key technologies:**
- **Expo Router** — file-based routing (layout groups: `(auth)` for unauthenticated, `(tabs)` for main app)
- **NativeWind v5** — Tailwind CSS v4 for React Native styling
- **Supabase** — PostgreSQL backend, auth, realtime, storage
- **Class Variance Authority (CVA)** — component variants
- **Moti** — animations

## Key Directories

| Path | Purpose |
|------|---------|
| `app/` | File-based routes (Expo Router) |
| `app/_layout.tsx` | Root layout — auth state, session redirect |
| `app/(auth)/` | Login/register screens |
| `app/(tabs)/` | Main app tabs (feed, communities, profile) |
| `components/` | Reusable UI components |
| `components/ui/` | Primitive UI components (button, etc.) |
| `providers/` | React Context providers |
| `providers/AuthProvider.tsx` | Supabase session management |
| `hooks/` | Custom React hooks |
| `lib/supabase.ts` | Supabase client initialization |
| `constants/theme.ts` | Color palette, spacing, typography |
| `supabase/migrations/` | SQL migrations (run in order) |
| `supabase/config.toml` | Local Supabase dev config |

## Authentication Flow

`AuthProvider` wraps the entire app and manages the Supabase session. The root `_layout.tsx` reads auth state and redirects to `/login` when no session is present. OAuth uses Expo Web Browser + deep linking. Sessions are persisted via Expo Secure Store.

## Database

Supabase migrations in `supabase/migrations/` set up (in order):
1. Extensions/schemas
2. Catalogs (exercise types, body parts, etc.)
3. User profiles
4. Body history
5. Follow system (auto-accept if public, counter updates)
6. Routines & exercises
7. Personal records
8. Social feed (posts, media, likes, comments, replies)
9. Groups, labels, competitions, evidence, votes — all with RLS

## Styling

All styling uses NativeWind (Tailwind classes on React Native components). Dark mode is handled via CSS `prefers-color-scheme` in `global.css`. Use CVA for components that need multiple variants.

## Git Workflow

- **Default branch for PRs:** `develop` (not `main`)
- **Branch naming:** `feature/<desc>`, `fix/<desc>`, `hotfix/<desc>`, `chore/<desc>`, `docs/<desc>`
- **Commit convention:** `feat:`, `fix:`, `perf:`, `build:`, `ci:`, `docs:`, `refactor:`, `style:`, `test:`
- `main` branch triggers semantic-release + EAS production build for Android
- `develop` branch triggers prerelease versioning

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `develop-build.yml` — prerelease via semantic-release on push to `develop`
- `main-build.yml` — full release + EAS Android APK build on push to `main`
- Linter runs on every push
