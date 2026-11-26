# Living Sport

English · [Español](./README.md)

Fitness social network for Android built with Expo and Supabase. Users post to a feed, form communities and compete in exercises by submitting a video as evidence, which the community validates by voting. An approved entry becomes a verified personal record.

Team project. Nicolas Arbelaez created the repository and the technical foundation; [@SebasHDV](https://github.com/SebasHDV) and [@brayan200j-collab](https://github.com/brayan200j-collab) also contribute. This documentation describes the `develop` branch.

## Features

- Google sign-in (Supabase Auth); the session is stored in SecureStore.
- Feed with image or video posts, likes and comments.
- Communities: create, detail view, featured communities and ranking.
- Per-exercise competitions with video evidence, community vote validation (automatic approval or rejection once 3 votes form a majority), ranking and podium.
- Editable profile. The database schema also models followers, body history and personal records; verified records are created by competition validation.
- In-app notifications.
- Routines by day of the week.

### Roadmap (in development)

- AI-generated routines: today `app/routine/ai-routine.tsx` is a placeholder ("En desarrollo"). A Gemini Edge Function prototype exists only on the `feature/ai-routines` branch and is not integrated.
- Weekly podium with points redeemable for rewards: not implemented.

## Stack

| Layer | Technology |
| --- | --- |
| App | Expo ~54.0.34, React Native 0.81.5, React 19.1.0, TypeScript ~5.9.2 |
| Navigation | Expo Router ~6.0.23 |
| Styling | NativeWind ^5.0.0-preview.3, Tailwind CSS ^4.2.2, class-variance-authority |
| State | Zustand ^5.0.12, react-native-mmkv ^4.3.1 |
| Forms | React Hook Form ^7.72.1, Zod ^4.3.6 |
| UI and animation | Reanimated ~4.1.1, Moti ^0.30.0, FlashList 2.0.2, @gorhom/bottom-sheet ^5.2.9 |
| Backend | Supabase (PostgreSQL with RLS and audit triggers, Auth, Realtime, Deno Edge Functions), @supabase/supabase-js ^2.99.1 |
| Media | Cloudinary (uploaded from the Edge Functions) |
| Quality and delivery | ESLint ^9.25.0, Prettier ^3.8.1, Husky ^9.1.7, lint-staged, semantic-release ^24.2.5, GitHub Actions, EAS Build |

## Requirements

- Node.js 22 and npm (the repository ships `package-lock.json`; npm only).
- Android Studio with an emulator, or an Android device. The app targets Android only.
- A Supabase project and a Cloudinary account with an upload preset.
- Supabase CLI if you apply migrations or deploy functions.

## Getting started

```bash
git clone https://github.com/nicoarbelaez/living-sports-app.git
cd living-sports-app
git checkout develop
npm install
cp .env.example .env.local
```

Variables in `.env.local` (see `.env.example`):

| Variable | Description |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `PROJECT_REF` | Project ID, used by `npm run update-types` |

The Edge Functions read `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` as Supabase secrets:

```bash
supabase secrets set CLOUDINARY_CLOUD_NAME=... CLOUDINARY_UPLOAD_PRESET=...
```

Database and functions:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
supabase functions deploy create-post create-group create-competition submit-evidence
```

Start the app:

```bash
npm run android      # Metro plus an Android emulator or device
# or
npm run start        # opens the Expo menu; press "a" for Android
```

Never commit real keys: `.env` and `.env*.local` are in `.gitignore`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run start` | `expo start` |
| `npm run android` | `expo start -c --android` |
| `npm run lint` | ESLint over `app`, `components`, `providers`, `hooks`, `lib`, `constants` |
| `npm run format` | Prettier with the Tailwind plugin |
| `npm run update-types` | Regenerates the database types using `PROJECT_REF` |
| `npm run semantic:dry` | Dry-run release with semantic-release |

## Structure

```text
app/                 Expo Router routes: (auth), (tabs), community, competition, routine
features/            domains: communities, competitions, feed, notifications, profile
components/          reusable UI (feed, competition, community, ui)
providers/           AuthProvider, theme, scroll
stores/ hooks/ lib/  state, hooks and utilities (Supabase client, MMKV)
supabase/
  migrations/        schema, RLS, audit, catalogs
  functions/         create-post, create-group, create-competition, submit-evidence, _shared
  tests/             SQL tests 001 to 009
```

`develop` is moving from flat folders (`stores/`, `hooks/`, `components/`) to per-domain folders in `features/`, so both structures coexist.

Architecture with diagrams: [docs/architecture.en.md](./docs/architecture.en.md).

## Tests, CI and releases

- SQL tests for schema, RLS and triggers in `supabase/tests/`, plus Deno tests for the Edge Function utilities. There is no JavaScript test suite.
- `PR Check` (`.github/workflows/preview.yml`) runs `expo-doctor`, lint and an Android build check on every pull request.
- `Production Release` (`.github/workflows/main-build.yml`) runs semantic-release and a build on every push to `main`.
- EAS profiles in `eas.json`: `development`, `preview` (APK) and `production` (APK).

## Contributing

Always branch from `develop`, work on a `feature/`, `hotfix/`, `chore/` or `docs/` branch, and open the pull request against `develop` with squash merge. The full workflow, commit types and branch naming are in [CONTRIBUTING.md](./CONTRIBUTING.md). Mockups are on [Excalidraw](https://excalidraw.com/#room=fe51052756dd08f952e2,81v6_zqcd2q7A4Hs4ywT_A).

## License

See [LICENSE](./LICENSE).
