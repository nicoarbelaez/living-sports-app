---
name: living-sports-expo-supabase
description: Complete guide for building production-ready mobile fitness social network with Expo, React Native, NativeWind v5, and Supabase. Use this skill for building, optimizing, or debugging PostgreSQL schemas for fitness tracking, React Native/Expo frontends with NativeWind styling, authentication flows with native gesture handling, real-time features, media management (video/image compression, uploads), feed systems with infinite scroll, workout competitions, user profiles, push notifications, or deployment with EAS Build. Mentions specific Expo-compatible libraries for functionality without literal code generation.
compatibility:
  - Platform: iOS/Android via Expo SDK 52+
  - Framework: React Native with TypeScript (recommended)
  - Styling: NativeWind v5 + global.css (OKLch variables)
  - Backend: Supabase + PostgreSQL
  - Deployment: EAS Build (APK only, testing phase)
  - Branches: main (production) and develop (development)
  - Tools: Expo CLI, EAS CLI, bash, create_file, str_replace, view
---

# Living Sports - Expo + Supabase Mobile Stack

Production-ready guide for building a **fitness social network** on mobile (iOS/Android) with **Expo**, **React Native**, **NativeWind v5**, and **Supabase**.

## 🎯 About Living Sports

**Living Sports** is a mobile-first fitness social platform where users:
- **Feed**: Upload workout videos/images with exercise metadata
- **Competitions**: Real-time challenges with friends (running distances, reps, etc.)
- **Profiles**: Training routines, workout history, achievements, followers
- **Social**: Comments, likes, friend requests, notifications
- **Offline-First**: Works when connection drops, syncs when restored

### Why Expo + React Native?
- Single codebase for iOS & Android
- Native performance + JavaScript flexibility
- Access to device hardware (camera, gallery, notifications, etc.)
- Fast iteration with live reload
- EAS Build for frictionless deployment (APK generation)

---

## 📋 Skill Organization

This skill covers 5 specialized domains in `references/`:

### 1. **database.md** - PostgreSQL & Supabase
- Schema design for fitness tracking, competitions, social features
- Performance optimization (indexing, query patterns)
- Row-level security (RLS) policies
- Migrations with version control
- Real-time subscriptions (Supabase Realtime)
- Schema evolution patterns using JSONB

**When to use**: Database design, data modeling, RLS setup, optimization, schema changes

### 2. **frontend.md** - React Native & NativeWind
- React Native component architecture (Expo patterns)
- NativeWind v5 with `View`, `ScrollView`, `FlatList`, `MotiView`, etc.
- Global styling system with OKLch CSS variables
- Mobile-first responsive design (breakpoints for tablet/desktop)
- Touch gestures and native interactions (`react-native-gesture-handler`)
- Media handling (image compression, video thumbnails, gallery integration)
- Feed with infinite scroll & pagination
- Forms with validation and error handling
- Navigation patterns (stack, tab, drawer)
- Performance optimization (lazy loading, memoization)
- Accessibility (a11y) for mobile

**Expo-compatible libraries mentioned**: `react-native-gesture-handler`, `react-native-reanimated`, `react-native-screens`, `react-native-safe-area-context`, `@react-navigation/*`, `react-native-image-crop-picker`, `expo-image-manipulator`, `react-native-video`, `bottomsheet`, `lottie-react-native`, `react-native-vision-camera`, etc.

**When to use**: Component design, styling, layouts, media handling, navigation, gestures, animations

### 3. **auth-security.md** - Authentication & Mobile Security
- Supabase Auth flows (email/password, OAuth, biometric)
- Session management with AsyncStorage
- JWT token refresh and storage
- Security best practices for mobile (API keys, secrets)
- Push notifications for authentication events
- Permission handling (camera, gallery, notifications)
- Role-based access control (RBAC) and RLS
- Offline auth state with local storage

**When to use**: Auth implementation, permissions, security hardening, token management

### 4. **integration-deployment.md** - APIs, Real-Time & Deployment
- Supabase API integration patterns (queries, mutations, subscriptions)
- Real-time features (competitions scores, feed updates, notifications)
- Media upload to Supabase Storage with progress tracking
- Push notifications (Expo Push Notifications)
- Offline sync strategies (AsyncStorage, WatermelonDB, Realm)
- EAS Build configuration and APK generation
- Environment configuration (.env files)
- Error handling and logging
- Monitoring and debugging with Expo CLI

**When to use**: API integration, real-time setup, media uploads, notifications, deployment

### 5. **Database Schema Evolution** (within database.md)
- JSONB patterns for flexible schema changes
- Migration versioning strategy
- Backward-compatible schema updates
- Testing schema changes before deployment

**When to use**: Planning DB changes, handling schema evolution without breaking changes

---

## 🚀 Quick Start Workflow

1. **Clarify the task**: Database design? UI component? Auth? Media upload? Real-time feature?
2. **Consult the appropriate reference file**
3. **Review patterns and Expo-compatible libraries** mentioned
4. **Implement using recommended libraries** (patterns, not literal code)
5. **Test on simulator/device** with Expo Go or custom build
6. **Deploy**: Push to develop branch → EAS Build generates APK

---

## 📚 How to Navigate This Skill

- **Database questions**: Jump to `references/database.md` → Find relevant section → Apply patterns
- **Frontend/UI/Components**: Jump to `references/frontend.md` → Review React Native approach → Use NativeWind
- **Auth flows & security**: Jump to `references/auth-security.md` → Select flow type → Implement with AsyncStorage
- **APIs, real-time, deployment**: Jump to `references/integration-deployment.md` → Configure Supabase → Deploy with EAS
- **Schema changes**: Jump to `references/database.md` → See JSONB patterns or migrations → Communicate changes

---

## Key Principles

✅ **Mobile-first design**: Optimize for touch, gestures, small screens, offline connectivity
✅ **Expo compatibility**: Use libraries from Expo SDK or community (no Xcode/Android Studio)
✅ **Database-first**: Design schema correctly for fitness tracking, real-time competitions, social features
✅ **Security by default**: RLS policies, AsyncStorage for tokens, input validation, permission handling
✅ **Performance matters**: Lazy load feeds, memoize components, optimize images, use FlatList for lists
✅ **Offline resilience**: Cache data locally, sync when connection returns (critical for mobile)
✅ **Real-time ready**: Design tables for subscriptions (scores, feed updates, notifications)
✅ **Gesture-first**: Use `react-native-gesture-handler` for natural interactions
✅ **Schema flexibility**: Use JSONB for semi-structured data; expect frequent changes

---

## Common Workflows

### Building a Feed Feature
1. Design PostgreSQL tables (posts, media URLs, likes, comments)
2. Create migration with proper indexes and RLS
3. Build React Native `FlatList` with pagination
4. Implement infinite scroll using `onEndReached`
5. Add image optimization with `expo-image-manipulator`
6. Apply NativeWind styling with color variables
7. Set up real-time subscriptions for live feed updates
8. Implement offline caching with AsyncStorage
9. Test with Expo Go on device

### Building a Competition Feature
1. Design tables (competitions, entries, scoring, leaderboards)
2. Create triggers for real-time score updates
3. Build real-time subscription with Supabase
4. Create leaderboard component with animated transitions (Reanimated)
5. Add push notifications for score updates
6. Implement gesture-based score submission (swipe, tap)
7. Test edge cases (simultaneous scores, offline scenarios)

### Building a Media Upload
1. Use `react-native-image-crop-picker` or `expo-image-picker` for gallery/camera
2. Compress images with `expo-image-manipulator`
3. Optimize videos with `react-native-video` or `expo-av`
4. Upload to Supabase Storage with progress tracking
5. Store metadata (URL, size, duration) in database
6. Display with thumbnail caching
7. Handle upload failures with retry logic

### Building Gesture Navigation (Bottom Sheet)
1. Use `@react-native-menu/bottom-sheet` or `react-native-modal-bottom-sheet`
2. Animate with `react-native-reanimated` for smooth transitions
3. Gesture handling via `react-native-gesture-handler` (swipe down to close)
4. Integrate with `@react-navigation` for stack navigation
5. Test on both iOS and Android

### Building Real-Time Notifications
1. Configure `expo-notifications` for push setup
2. Use Supabase Realtime subscriptions for events
3. Trigger notifications via Edge Functions or Postgres triggers
4. Handle notification taps with `expo-linking` for deep linking
5. Test with Expo CLI (local testing) and EAS Build (production testing)

### Schema Evolution (Database Changes)
1. Use JSONB columns for flexible evolution
2. Create versioned migration files
3. Apply backward-compatible updates
4. Test on develop branch with APK build
5. Merge to main after validation
6. Monitor for issues post-deployment

---

## Reference Files Overview

| File | Size | Purpose |
|------|------|---------|
| `database.md` | ~500 lines | PostgreSQL design, fitness schema, migrations, RLS, real-time |
| `frontend.md` | ~600 lines | React Native, NativeWind, components, media, navigation, gestures |
| `auth-security.md` | ~350 lines | Auth flows, permissions, security for mobile |
| `integration-deployment.md` | ~400 lines | Supabase APIs, real-time, media uploads, EAS Build deployment |

**Total reference content**: ~1850 lines of detailed patterns, Expo library recommendations, and best practices.

---

## Expo-Compatible Libraries (Quick Reference)

### Navigation
- `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`
- `@react-navigation/drawer`

### Gestures & Animations
- `react-native-gesture-handler` (tap, swipe, long-press, pan)
- `react-native-reanimated` (smooth animations, transitions)
- `react-native-screens` (native screen containers)

### UI Components
- `react-native-modal-bottom-sheet` or `@react-native-menu/bottom-sheet` (bottom modals)
- `lottie-react-native` (animations)
- `react-native-vector-icons` (icons, all platforms)

### Media
- `react-native-image-crop-picker` (gallery/camera picker)
- `expo-image-manipulator` (image compression, scaling, rotation)
- `react-native-video` (video playback with controls)
- `expo-av` (audio/video playback)
- `expo-image-picker` (Expo built-in alternative)
- `expo-camera` (camera access)

### Notifications & Push
- `expo-notifications` (push notifications setup)
- `expo-linking` (deep linking for notification taps)

### Storage & Offline
- `@react-native-async-storage/async-storage` (key-value storage, RLS tokens)
- `WatermelonDB` or `Realm` (local database for offline sync)
- `@react-native-community/netinfo` (detect connection status)

### Forms & Validation
- `react-hook-form` (form state management)
- `zod` or `yup` (schema validation)

### State Management
- `zustand` (lightweight state)
- `TanStack Query` (data fetching, caching)
- React Context (simple state)

### Styling
- `NativeWind v5` (Tailwind for React Native)
- `global.css` with OKLch variables (theming)

### Development
- `Expo CLI` (local development, preview, build)
- `EAS CLI` (production builds)
- `Expo Go` (testing on device)

---

## Tips for Using This Skill

🎯 **Be specific**: "How do I implement infinite scroll for the feed?" better than "feed is slow"
🎯 **Provide context**: Share schema, component code, library errors, or mock data
🎯 **Ask for patterns**: "Show me the pattern for..." gets better results than "build this"
🎯 **Reference sections**: "I'm in the media upload section" helps narrow down assistance
🎯 **Libraries first**: Always mention if using specific Expo libraries
🎯 **Mobile context**: Remember this is React Native—no DOM, no CSS, use View/ScrollView/FlatList
🎯 **Branches**: develop for testing APKs, main for production
🎯 **Schema changes**: Don't worry about reexplaining DB changes—use JSONB or migrations

---

## Getting Started with Living Sports

### Prerequisites
- Node.js 18+, npm/yarn
- Expo SDK 52+
- EAS CLI (`npm install -g eas-cli`)
- Supabase project setup
- NativeWind v5 configured in your Expo project

### Folder Structure
```
living-sports-app/
├── app/                      # Expo Router navigation
│   ├── (auth)/              # Auth screens
│   ├── (tabs)/              # Main app screens
│   └── _layout.tsx
├── components/
│   ├── feed/
│   ├── competition/
│   ├── profile/
│   └── common/
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   └── types.ts
├── styles/
│   └── global.css           # NativeWind config + OKLch variables
├── eas.json                 # EAS Build configuration
├── app.json                 # Expo configuration
└── tailwind.config.js       # (Not modified—leave as is)
```

### First Steps
1. Initialize Expo project: `npx create-expo-app living-sports`
2. Set up NativeWind: Configure `global.css` with OKLch variables
3. Initialize Supabase client for React Native
4. Set up Expo Router for navigation
5. Build first feature (e.g., authentication)
6. Test on Expo Go or EAS Build preview
7. Iterate based on `references/` patterns

---

## Support & Debugging

- **Expo CLI docs**: `https://docs.expo.dev`
- **React Native docs**: `https://reactnative.dev`
- **Supabase docs**: `https://supabase.com/docs`
- **NativeWind docs**: `https://www.nativewind.dev`
- **EAS Build docs**: `https://docs.expo.dev/build/setup`

When stuck:
1. Check the relevant `references/` file for patterns
2. Search Expo community (Discord, GitHub)
3. Review Supabase RLS policies if data access issues
4. Use `expo start --dev-client` for better debugging
5. Check browser DevTools via `expo start --localhost`