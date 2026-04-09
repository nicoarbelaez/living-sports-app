---
title: Authentication, Security & Mobile Permissions
version: 1.0
---

# Authentication, Security & Mobile Permissions

Securing Expo apps with Supabase Auth, managing tokens on mobile, handling permissions, and protecting user data.

## Table of Contents
1. [Supabase Auth Architecture](#supabase-auth-architecture)
2. [Email/Password Authentication](#emailpassword-authentication)
3. [OAuth Providers (Google, Apple)](#oauth-providers-google-apple)
4. [Token & Session Management](#token--session-management)
5. [Biometric Authentication](#biometric-authentication)
6. [Mobile Permissions](#mobile-permissions)
7. [Authorization & RLS](#authorization--rls)
8. [Security Best Practices](#security-best-practices)
9. [Error Handling & User Feedback](#error-handling--user-feedback)

---

## Supabase Auth Architecture

### How Auth Works in Expo

```
┌─────────────────┐         ┌──────────────┐         ┌──────────────┐
│  Expo App       │         │  Supabase    │         │  PostgreSQL  │
│  (React Native) │◄───────►│  Auth        │◄───────►│  + RLS       │
└─────────────────┘         └──────────────┘         └──────────────┘
   JWT Token           Exchange credentials    Enforces row-level
   AsyncStorage        Issue/refresh token     security policies
```

### Initialization

Create Supabase client for React Native with proper storage:

Pattern: Initialize Supabase with `AsyncStorage` for token persistence (not localStorage, which doesn't exist in React Native).

Libraries: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`

Implementation approach:
- Create `supabase.ts` file exporting Supabase client
- Configure with AsyncStorage for token persistence
- Set up auth state listener to track login/logout
- Handle session restoration on app launch
- Refresh tokens automatically before expiry

No literal code—use Supabase docs for setup, ensuring AsyncStorage is configured.

---

## Email/Password Authentication

### Sign Up (Registration)

Pattern: User enters email/password → Supabase sends confirmation email → User confirms → Account active

Implementation approach:
- Create form with TextInput for email, password
- Validate email format and password strength (min 8 chars, uppercase, number)
- Call Supabase `signUp()` with email, password, and optional metadata
- Show success message: "Check your email to confirm your account"
- Handle error cases (email already registered, weak password, network error)
- Optional: Auto-redirect to login after signup
- Test with real email (required by Supabase)

### Login (Sign In)

Pattern: User enters email/password → Supabase verifies → Returns JWT token → App stores token

Implementation approach:
- Create form with email and password inputs
- Show "loading" state during sign-in
- Call Supabase `signInWithPassword()`
- On success: Store session in state, navigate to home screen
- On error: Show error message (account doesn't exist, wrong password, not confirmed)
- Add "Forgot Password?" link
- Optional: Remember email (store locally for convenience, not password)
- Test with both confirmed and unconfirmed accounts

### Password Reset

Pattern: User clicks "Forgot password" → Enters email → Supabase sends reset link → User clicks link in email → New password set

Implementation approach:
- Create "Forgot Password" screen with email input
- Call Supabase `resetPasswordForEmail(email, { redirectTo: '...' })`
- Show message: "Check your email for reset link"
- Handle reset callback (extract token from URL, set new password)
- For mobile: Use deep linking to handle reset link taps
- Show password strength requirements
- Confirm new password (two fields, must match)

---

## OAuth Providers (Google, Apple)

### Google OAuth

Pattern: User taps "Sign in with Google" → Google login → Return to app authenticated

Libraries: `expo-auth-session`, `expo-web-browser`, Supabase OAuth config

Implementation approach:
- Configure Google OAuth in Supabase dashboard (get Client ID)
- Use `expo-auth-session` to handle OAuth flow
- User taps button → Opens browser → Google login → Redirects back to app
- Extract auth code from redirect
- Exchange for JWT with Supabase
- Store token in AsyncStorage
- Create user profile on first login (if user table doesn't exist)
- Test on both simulator and real device

### Apple OAuth

Pattern: Same as Google, but Apple's sign-in (required on iOS)

Libraries: `expo-auth-session`, `expo-apple-authentication`

Implementation approach:
- Similar to Google OAuth setup
- Use `expo-apple-authentication` for native feel on iOS
- Fall back to OAuth flow on Android (Apple doesn't support native Android auth)
- Collect email/name on first login (Apple doesn't always provide)
- Handle privacy (Apple hides email from app)
- Test on both iOS and Android

### OAuth Callback Handling

After OAuth redirect, handle the response:

Pattern: OAuth returns auth code → App exchanges for JWT → Stores token → Navigates to home

Implementation approach:
- Set up linking configuration in Expo Router
- Define scheme (e.g., `living-sports://auth-callback`)
- Listen for deep link in auth context
- Parse response for auth code/error
- If success: Exchange token, store session, navigate home
- If error: Show error message, stay on login screen
- No manual navigation—let linking handle it

---

## Token & Session Management

### JWT Tokens in React Native

Unlike web (localStorage), React Native must store tokens in `AsyncStorage` (encrypted on-device storage).

Pattern: Token persisted → App restores session on launch → Automatic refresh before expiry

Implementation approach:
- Supabase client auto-persists token to AsyncStorage (if configured)
- On app launch, call `getSession()` to restore logged-in state
- Set up auth state listener to track login/logout
- Automatically refresh token before expiry (Supabase handles this)
- On app foreground, validate token and refresh if needed
- On app background, don't clear token (persists across sessions)
- Logout: Call `signOut()` which clears token and session

### Handling Token Expiry

Tokens expire after ~1 hour. Supabase auto-refreshes, but handle edge cases:

Pattern: Token expired → Auto-refresh → Retry failed request → Or force re-login if refresh fails

Implementation approach:
- Supabase auto-refreshes tokens via `onAuthStateChange`
- If request fails with 401 (unauthorized), auto-refresh and retry
- If refresh fails (network down, user logged out elsewhere), redirect to login
- Show "session expired, please log in again" message
- Test by logging in, waiting >1 hour (or manually clear token), making request

### Session Listeners

Monitor auth state changes (login, logout, token refresh):

Libraries: Supabase `onAuthStateChange` method

Implementation approach:
- Set up listener in auth context or top-level provider
- Listen for `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED` events
- Update local state with current user and session
- Unsubscribe listener on component unmount
- Use listener for navigation (if no session, show login screen)
- Test: Sign in, sign out, kill app and restore session

---

## Biometric Authentication

### Fingerprint / Face ID Login

Pattern: User's first login with email/password → Enable biometric → Later: Biometric login

Libraries: `expo-local-authentication`

Implementation approach:
- After successful email/password login, ask "Enable fingerprint login?"
- Check if device supports biometric (iOS: Face ID, Touch ID; Android: Fingerprint)
- Store encrypted token locally with biometric protection
- On next app launch, offer "Use fingerprint to sign in"
- Call `LocalAuthentication.authenticateAsync()` to trigger prompt
- If biometric succeeds, retrieve stored token and restore session
- If fails (wrong fingerprint), fall back to email/password login
- Add option to disable biometric in settings
- Test on device (simulator may not have biometric)

---

## Mobile Permissions

### Camera Permission

Pattern: User taps "Take photo" → Permission prompt → Camera opens or denied

Libraries: `expo-camera` (built-in)

Implementation approach:
- Before opening camera, request permission with `useCameraPermissions()`
- Show prompt only on first use (Android) or each time (iOS)
- User grants/denies → App stores result
- If granted: Open camera, capture photo, save to app storage or upload
- If denied: Show message "Camera access required" with link to settings
- Handle permission revocation (user changes settings mid-session)
- Test on both Android and iOS

### Photo Library Permission

Pattern: User taps "Choose from gallery" → Permission prompt → Photo picker opens

Libraries: `react-native-image-crop-picker` or `expo-image-picker`

Implementation approach:
- Request library permission with `requestPermissions()`
- Show permission prompt
- If granted: Open image picker, allow select/crop/rotate
- If denied: Show message with link to settings
- Handle permission changes mid-session
- Test on both iOS and Android (permissions differ)

### Notification Permission

Pattern: App sends push notifications → Permission prompt → User grants → Notifications appear

Libraries: `expo-notifications`

Implementation approach:
- On app launch or settings screen, request notification permission
- Call `Notifications.requestPermissionsAsync()`
- User grants/denies
- If granted: Store device push token, send to database
- If denied: Show message "Enable notifications for live updates"
- Ask again on next app launch (if persistently disabled, stop asking)
- Test with actual device (simulator notifications limited)

### Location Permission (Optional)

Pattern: User logs workout → App records location → Shows on map

Libraries: `expo-location`

Implementation approach:
- Request foreground/background location when needed
- Foreground: Only while app in focus (workout in progress)
- Background: Continue tracking even if app backgrounded (background task)
- Show privacy message ("We use your location to map your routes")
- Allow opt-out (skip recording location)
- Clear location data option in settings
- Test on device with GPS

---

## Authorization & RLS

### Row-Level Security (RLS)

RLS enforces database-level permissions. Even if user somehow bypasses frontend auth, RLS protects data.

Pattern: User queries database → RLS checks `auth.uid()` → Returns only user's data or public data

RLS setup in PostgreSQL (example):
- Enable RLS on sensitive tables
- Create policies checking `auth.uid() = user_id`
- Only data matching policy is returned

In Expo app:
- You don't set RLS policies in the app code
- Policies are in database migrations
- Just trust that RLS is enforced
- Test by querying as different users and verifying data isolation

### Using Auth Context

Pattern: App has current user → Pass down via context → Components check user for permissions

Implementation approach:
- Create AuthContext with `user`, `session`, `loading` state
- Set up listener to populate context on app launch
- Wrap app with AuthProvider
- Use `useAuth()` hook in components to access user
- Check permissions before showing UI (e.g., only show "Delete" button if user owns post)
- Navigate to login if no user

Libraries: React Context (built-in), or state management (Zustand, Redux)

---

## Security Best Practices

### Environment Variables

Pattern: API keys, Supabase URL stored in `.env`, not in code

Implementation approach:
- Create `.env.local` (don't commit to git)
- Store `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Prefix with `EXPO_PUBLIC_` so Expo includes in app
- Access with `process.env.EXPO_PUBLIC_SUPABASE_URL`
- Use `.env.production` for production values
- On CI/CD (EAS Build), set env vars in build secrets (not in code)

Note: `ANON_KEY` is public (safe). RLS policies protect data. Don't include `SERVICE_ROLE_KEY` in app.

### Input Validation

Pattern: Validate email format, password strength, username length before sending to server

Libraries: `zod`, `yup` (schema validation), `react-hook-form` (form state)

Implementation approach:
- Define schema for each form (login, signup, profile)
- Validate on client side (user feedback)
- Server also validates (defense in depth)
- Email: Valid format, not already registered
- Password: Min 8 chars, uppercase, number, no common patterns
- Username: 3-50 chars, alphanumeric + underscore, unique
- Show specific error messages (e.g., "Username already taken")

### API Security

Pattern: Always use HTTPS, validate responses, handle errors safely

Implementation approach:
- Supabase enforces HTTPS (no hardcoded HTTP)
- Validate API responses (check for expected fields)
- Handle 401 (unauthorized) by clearing session and redirecting to login
- Handle 403 (forbidden) by showing "Access denied" message
- Never log sensitive data (tokens, passwords)
- Use Supabase's parameterized queries (prevents SQL injection)

### No Sensitive Data in AsyncStorage

❌ Never store: Passwords, credit cards, medical data
✅ Safe to store: JWT tokens (encrypted by OS), user ID, username

Pattern: Tokens auto-encrypted by AsyncStorage

Implementation approach:
- Supabase tokens stored securely (Android: Encrypted Shared Preferences, iOS: Keychain)
- Don't manually store passwords or secrets
- For extra sensitivity (medical data), encrypt locally with `expo-crypto`
- Test: Inspect device storage with DevTools (tokens should be unreadable)

### Deep Linking Security

Pattern: Notification taps → Deep link → Malicious links from browser

Implementation approach:
- Validate deep link origin (only accept links from your domain)
- Whitelist allowed paths in linking configuration
- Don't pass sensitive data in URLs (use route params instead)
- Validate token in JWT (Supabase does this automatically)
- Test with malicious URLs (e.g., `myapp://steal-token?token=xxx`)

---

## Error Handling & User Feedback

### Auth Error Types

Pattern: Different errors (network, invalid credentials, unconfirmed) need different messages

Error handling approach:
- Network error: "No internet connection. Check your network and try again."
- Invalid credentials: "Email or password is incorrect."
- Email not confirmed: "Check your email for confirmation link."
- Email already registered: "This email is already in use."
- Weak password: "Password must be at least 8 characters..."
- Rate limited: "Too many login attempts. Try again in 15 minutes."
- Server error: "Something went wrong. Please try again later."

Show user-friendly messages, not technical error codes.

### Loading States

Pattern: Show spinner/skeleton while auth request in progress

Implementation approach:
- Set `loading = true` before API call
- Show spinner or disabled button during load
- Show error or success message on response
- Set `loading = false`
- Prevent double-submit (disable button while loading)

### Session Restoration

Pattern: App launches → Check if user logged in → Restore session → Show home or login

Implementation approach:
- Show splash screen while checking auth state
- Call `getSession()` on app launch
- If session found: Restore user state, navigate to home
- If no session: Navigate to login
- Handle "checking" state (show splash/blank screen)
- Don't show flash of login screen then home (confusing)

### Logout

Pattern: User taps logout → Clear session → Show login screen

Implementation approach:
- Call Supabase `signOut()`
- Clear user state
- Clear any cached data (optional, can keep some)
- Navigate to login screen
- Optional: Show message "Successfully logged out"
- Don't keep login history visible

---

## Permissions Checklist

### iOS (Info.plist)

- [ ] Camera: `NSCameraUsageDescription`
- [ ] Photo Library: `NSPhotoLibraryUsageDescription`
- [ ] Notifications: Handled by Expo
- [ ] Location: `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`
- [ ] Microphone: `NSMicrophoneUsageDescription` (if recording audio)

### Android (AndroidManifest.xml)

- [ ] Camera: `android.permission.CAMERA`
- [ ] Photo Library: `android.permission.READ_EXTERNAL_STORAGE`
- [ ] Notifications: Handled by Expo
- [ ] Location: `android.permission.ACCESS_FINE_LOCATION`, `android.permission.ACCESS_COARSE_LOCATION`
- [ ] Internet: `android.permission.INTERNET` (required)

These are auto-configured by Expo, but verify in `app.json` or native files.

---

## Testing Auth Flows

### Manual Testing Checklist

- [ ] Signup with valid email/password
- [ ] Signup with weak password (shows error)
- [ ] Signup with existing email (shows error)
- [ ] Confirm email link works
- [ ] Login with correct credentials
- [ ] Login with wrong password (shows error)
- [ ] Forgot password flow
- [ ] OAuth (Google/Apple) flow on real device
- [ ] Biometric setup and login
- [ ] Token refresh (wait >1 hour or mock time)
- [ ] Logout clears session
- [ ] App restart restores session (if logged in)
- [ ] Permissions requested on first use
- [ ] Deep linking from notifications
- [ ] RLS prevents unauthorized data access

### Automated Testing

Libraries: `@testing-library/react-native`, `jest`

Pattern: Mock Supabase, test auth flows without network

Implementation approach:
- Mock `supabase-js` client in tests
- Test signup/login/logout flows
- Test permission requests
- Test RLS policies (server-side, harder to test)
- Test error handling
- Use `@testing-library/react-native` for component testing

---

## Security Audit Checklist

- [ ] All sensitive endpoints use HTTPS
- [ ] Tokens stored securely (AsyncStorage, Keychain)
- [ ] RLS enabled on sensitive tables
- [ ] Input validation on all forms
- [ ] No secrets in code (env vars only)
- [ ] API keys not logged or exposed
- [ ] Deep links validated
- [ ] Permissions requested with context
- [ ] Session timeouts implemented
- [ ] Logout clears all sensitive data
- [ ] Error messages don't leak info (no SQL errors to user)
- [ ] Rate limiting on auth endpoints (server-side)
- [ ] CORS configured (if external API)
- [ ] Dependencies kept up-to-date (`expo upgrade`)