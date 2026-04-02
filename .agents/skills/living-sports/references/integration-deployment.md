---
title: Integration, Real-time & Deployment for Expo
version: 1.0
---

# Integration, Real-time & Deployment for Expo

## Table of Contents
1. [Supabase Real-time Subscriptions](#supabase-real-time-subscriptions)
2. [API Integration Patterns](#api-integration-patterns)
3. [Media Upload & Storage](#media-upload--storage)
4. [Environment Configuration](#environment-configuration)
5. [EAS Build Workflow](#eas-build-workflow)
6. [Offline Sync Strategy](#offline-sync-strategy)
7. [Push Notifications](#push-notifications)
8. [Monitoring & Error Handling](#monitoring--error-handling)
9. [CI/CD for Expo](#cicd-for-expo)

---

## Supabase Real-time Subscriptions

### What is Real-time?

Real-time allows Expo app to receive live updates from PostgreSQL without polling. When data changes, subscriptions notify connected clients instantly.

**Use cases in Living Sports**:
- Feed: See new posts as they're uploaded
- Leaderboard: Watch competition scores update live
- Comments: See new comments on posts
- Notifications: Get alerts for achievements

### Subscription Pattern

**Pattern**: Subscribe to table changes, update UI

```
Steps:
1. Component mounts
2. Subscribe to table (e.g., 'posts' table)
3. Specify event type: INSERT, UPDATE, DELETE
4. On event, receive payload and update state
5. Component unmounts, unsubscribe
6. Handle network reconnection
```

**Libraries**:
- `@supabase/supabase-js`: Built-in subscription support

### Feed Real-time Pattern

**Pattern**: Show new posts as they're created

```
Steps:
1. Load initial 20 posts
2. Subscribe to INSERT events on posts table
3. New post arrives → Prepend to feed
4. Show "New post" indicator or auto-scroll
5. User can dismiss or view new posts
```

**Considerations**:
- Don't auto-scroll (annoying if user scrolling)
- Show badge/indicator for new posts
- Allow user to manually load new posts
- Handle duplicate posts (user might see both in initial load and subscription)

### Leaderboard Real-time Pattern

**Pattern**: Live score updates during competition

```
Steps:
1. Load leaderboard (competition_entries with scores)
2. Subscribe to UPDATE events on competition_entries
3. User submits score → Entry updated
4. Subscription fires → Animate score change
5. Recalculate ranks (PostgreSQL trigger updates rank)
6. Other users see new ranks
```

**Considerations**:
- Animate rank changes smoothly (react-native-reanimated)
- Highlight row of user who just scored
- Show "Live" indicator
- Handle offline: Queue updates, sync when online

### Subscription Cleanup Pattern

**Pattern**: Unsubscribe when component unmounts

```
Steps:
1. Component mounts
2. Create subscription object
3. Render component
4. Component unmounts → Call unsubscribe()
5. Clean up resources
```

**Libraries**:
- `useEffect` cleanup function automatically unsubscribes

---

## API Integration Patterns

### REST API Pattern (Supabase Client)

**Pattern**: Use Supabase client for database queries

```
How it works:
- Supabase client wraps PostgreSQL
- Call .from().select() for queries
- Automatically includes JWT in headers
- RLS policies enforce permissions
- Return data or error
```

### Calling PostgreSQL Functions from Expo

**Pattern**: Call custom database functions from Expo app

```
Use case:
- Complex business logic (scoring, ranking)
- Atomic operations (update multiple tables)
- Server-side validation

Pattern:
- Define function in PostgreSQL
- Call with supabase.rpc('function_name', {params})
- Function executes with user's permissions
- Return result or error
```

### Error Handling Pattern

**Pattern**: Catch and handle errors gracefully

```
Steps:
1. Try to execute query
2. If error:
   - Network error: Show "No internet"
   - Auth error: Redirect to login
   - Permission error: Show "Access denied"
   - Validation error: Show validation message
3. Show error toast or modal
4. Allow user to retry
```

### Retry Logic Pattern

**Pattern**: Retry failed requests automatically

```
Use case: Flaky network, transient server errors

Pattern:
- First attempt: Normal request
- If error with retry-able code: Wait 1 second, retry
- If still fails: Wait 2 seconds, retry (exponential backoff)
- After 3 attempts: Show error to user
```

### Query Optimization Pattern

**Pattern**: Fetch only needed columns

```
Bad (unnecessary data):
SELECT * FROM posts;

Good (specific columns):
SELECT id, caption, media_urls, created_at FROM posts;

Saves: Network bandwidth, faster parsing
```

---

## Media Upload & Storage

### Image Upload Pattern

**Pattern**: Compress, upload to Supabase Storage, store URL in DB

**Step 1: Select Image**
- Use `expo-image-picker` to let user pick from camera roll
- Or `expo-camera` for live camera capture
- Get image URI and metadata

**Step 2: Compress Image**
- Use `react-native-compressimage` or similar
- Target dimensions: 1080px width (mobile screen size)
- Target quality: 70-80 JPEG quality
- Result: ~200-400KB file

**Step 3: Upload to Supabase Storage**
- Libraries: `@supabase/supabase-js` built-in upload
- Bucket name: `posts` or `media`
- File path: `/posts/{postId}/{timestamp}.jpg`
- Show progress indicator (upload can take seconds on slow connection)

**Step 4: Store URL in Database**
- Get public S3 URL from Supabase
- Store in `posts.media_urls` array
- RLS ensures user owns post

**Considerations**:
- Handle upload failure: Show retry button
- Show progress bar (% uploaded)
- Cancel button during upload
- Compress in background (don't block UI)

### Video Upload Pattern

**Pattern**: Compress, upload, store reference

**Step 1: Select Video**
- Use `expo-media-library` to browse device videos
- Or `expo-camera` for recording
- Get video URI and duration

**Step 2: Compress Video**
- Use library like `react-native-video-compress` (FFmpeg-based)
- Target resolution: 480p (mobile playback)
- Target bitrate: 2-5 Mbps
- Result: < 50MB for typical workout video
- Takes time (minutes for long videos)

**Step 3: Upload with Progress**
- Resume uploads if interrupted
- Show progress (MB uploaded / total)
- Queue offline uploads (if offline, save to AsyncStorage)

**Step 4: Create Thumbnail**
- Extract first frame or middle frame
- Store as JPEG in Storage
- Display as preview before upload completes

**Considerations**:
- Video compression happens in background
- Show estimated time remaining
- Allow cancel during compression/upload
- Warn user about data usage on cellular
- Cache thumbnails locally

### Thumbnail & Progressive Image Loading

**Pattern**: Show low-res while high-res loads

**Using expo-image library**:
- Supports JPEG progressive loading
- Auto-cache for next app launch
- Supports blur placeholder
- Fallback on error

**Pattern**:
1. Decode low-res JPEG (thumbnail)
2. Show blurred thumbnail instantly
3. Load high-res JPEG in background
4. Transition to high-res when ready
5. Cache for next view

---

## Environment Configuration

### Managing Secrets in Expo

**Pattern**: Store secrets in `.env.local` and app.json

**File structure**:
```
.env.local (never commit):
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx

app.json (Expo config):
{
  "expo": {
    "plugins": ["./plugins/withEnv.js"]
  }
}
```

**Why EXPO_PUBLIC prefix**:
- `EXPO_PUBLIC_*` is safe to expose to client
- Anon key is safe (RLS enforces permissions)
- Other secrets (service key) never exposed

### Environment Variables for Each Build

**Pattern**: Different config per branch/environment

```
develop branch (testing):
- Staging Supabase project
- Allow loose RLS for testing

main branch (production):
- Production Supabase project
- Strict RLS policies
- Rate limiting enabled
- Monitoring enabled
```

### Accessing Environment Variables in Expo

```
Pattern:
- Access via process.env.EXPO_PUBLIC_KEY
- At build time (EAS Build)
- At runtime (in app)

Note: Must start with EXPO_PUBLIC_ prefix
```

---

## EAS Build Workflow

### What is EAS Build?

EAS Build is Expo's managed build service. Instead of building locally (requires Mac for iOS), cloud builds on Expo servers.

**For Living Sports**:
- Generates APK only (no Play Store)
- Used for testing before releasing
- Two branches: develop (testing), main (production)

### Build Triggers

**Manual trigger**:
```
Steps:
1. Commit to develop branch
2. Run: eas build --platform android
3. EAS builds in cloud
4. Download APK when complete
5. Install on test device
```

**CI/CD trigger** (automated):
```
Steps:
1. Commit to develop branch
2. GitHub/GitLab action triggers
3. Automatically runs eas build
4. Artifact generated and available
```

### Build Variants

**Development APK** (from develop branch):
- Debug symbols included
- Slower performance
- Used for testing features
- No code signing

**Production APK** (from main branch):
- Optimized performance
- Stripped debug symbols
- Code signed
- Ready for release (but not to Play Store)

### Build Configuration

**File: eas.json (Expo build config)**

```
Pattern:
- Define build profiles for develop and main branches
- Specify environment variables per profile
- Configure signing
- Set release channel
```

### Common EAS Build Issues

**Issue: Build fails with dependency error**
- Solution: Update Expo SDK, clean cache, rebuild

**Issue: APK too large**
- Solution: Enable code minification, tree-shaking

**Issue: Slow build**
- Solution: Use `--local` to build on machine (Mac for iOS)

---

## Offline Sync Strategy

### Why Offline Support?

Living Sports is a fitness app. Users might:
- Go to gym with no WiFi
- Train outdoors with poor connection
- Lose connection temporarily

**Offline-first architecture**:
- Cache data locally (AsyncStorage)
- Queue mutations offline
- Sync when connection returns

### Offline Cache Pattern

**Pattern**: Cache critical data locally

```
Data to cache:
- User profile (self-updating, small)
- Feed posts (large, refresh on view)
- Current user's competitions (important)

Cache strategy:
- On app launch: Check if offline
- If offline, load from AsyncStorage
- If online, fetch fresh from server
- Save new data to cache

Libraries:
- AsyncStorage: Simple key-value cache
- React Query: Advanced caching
- Zustand: State management with persistence
```

### Mutation Queue Pattern

**Pattern**: Queue actions offline, sync when online

```
Example: User creates post while offline

Steps:
1. User fills post form
2. Taps submit
3. App checks connection
4. If offline: Save to local queue (AsyncStorage)
5. Show "Saving offline..."
6. When online: Execute queued mutations
7. Show success/failure toast

Considerations:
- Queue structure: [{ type: 'create_post', data: {...} }, ...]
- Retry logic: Exponential backoff
- Conflict resolution: Server wins, notify user
```

### Connection Detection Pattern

**Pattern**: Detect when user goes online/offline

**Libraries**:
- `@react-native-community/netinfo`: Check connection status

**Pattern**:
- Listen for connection changes
- When online: Sync queued data
- When offline: Disable create features (optional)
- Show "Offline" indicator

---

## Push Notifications

### Why Push Notifications?

Keep users engaged with:
- New likes/comments on posts
- Competition updates (new scores, achievements)
- Friend activities (new posts, followed)
- Reminders for competitions

### Push Notification Setup Pattern

**Pattern**: Register device, receive notifications

**Step 1: Request Permission**
- iOS: Request user permission (required)
- Android: Auto-granted (no prompt)
- Show explanation: "Get updates on likes, comments, scores"

**Step 2: Get Device Token**
- Use `expo-notifications`
- Receive unique device token
- Send to backend (store in users table)

**Step 3: Backend Sends Notification**
- Server triggers notification via Supabase
- Targets user's device token
- Device receives notification
- Notification handler fires (dismiss, tap, background)

**Step 4: Handle Notification Tap**
- If user taps notification: Deep link to relevant screen
- Example: Notification about like → Open post detail
- Example: Notification about competition → Open leaderboard

### Local Notifications Pattern

**Pattern**: App sends notifications to itself

**Use case**: Offline reminders, timers, alerts

**Example**:
- User sets reminder for workout
- App schedules local notification
- At time, notification fires
- User taps → Open workout screen

**Libraries**:
- `expo-notifications`: Local and push

---

## Monitoring & Error Handling

### Error Logging Pattern

**Pattern**: Log errors to service for debugging

**What to log**:
- Network errors (offline, timeout, 5xx)
- Auth errors (session expired, permission denied)
- App crashes (uncaught exceptions)
- Business logic errors (validation, constraints)

**Libraries**:
- `sentry-expo`: Error tracking
- `firebase-crashlytics`: Crash reporting

**Pattern**:
- Catch all errors
- Log with context (user ID, action, time)
- Send to logging service
- Review logs in dashboard

### Network Error Handling

**Pattern**: Handle network failures gracefully

```
Errors:
- No internet: Show offline message
- Timeout: Retry, then show error
- Server error (5xx): Show "Server busy"
- Not found (404): Show "Item deleted"
```

### Performance Monitoring

**Pattern**: Track app performance

**Metrics**:
- Screen load time (how long does feed take to render?)
- API response time (how fast are Supabase queries?)
- Network latency
- Crash rate

**Libraries**:
- `expo-task-manager`: Background tasks
- `@sentry/tracing`: Performance monitoring

---

## CI/CD for Expo

### Automated Testing

**Pattern**: Run tests on every commit

```
Tests:
- Unit tests: Component logic
- Integration tests: API calls
- E2E tests: Full user flows

Example flow:
1. Commit to develop
2. GitHub Action runs tests
3. If pass: Proceed to build
4. If fail: Block merge, notify developer
```

### Automated Builds

**Pattern**: Build APK automatically

```
Example GitHub Actions workflow:
1. Commit to develop → Trigger action
2. Action runs tests
3. If pass: Trigger eas build
4. EAS builds APK
5. Upload artifact to GitHub Releases
6. Notify team: "New APK ready for testing"
```

### Staged Rollout

**Pattern**: Deploy to test users first

```
Channels (Expo Over-the-Air):
- production: Main users
- staging: Test users
- develop: Developers

Process:
1. Develop feature on develop branch
2. Deploy OTA to staging channel
3. Test users test feature
4. If good: Deploy to production
```

### Version Management

**Pattern**: Increment version on each build

```
Semantic versioning:
- MAJOR.MINOR.PATCH (1.2.3)
- 1.0.0: First release
- 1.1.0: New features
- 1.0.1: Bug fixes

Update:
- app.json: version field
- Commit with version bump
- Tag release in git
```

---

## Monitoring Production

### Key Metrics to Track

**User engagement**:
- Daily active users (DAU)
- Session duration
- Feature usage (feed, competitions, profile)

**Performance**:
- App crash rate
- API response time
- Network errors
- Screen load time

**Business**:
- User growth
- Post creation rate
- Competition participation
- Retention (% return weekly)

### Debugging Production Issues

**Pattern**: Diagnose issues reported by users

**Tools**:
- Sentry: Crash logs, stack traces
- Datadog: Performance metrics
- Supabase logs: Database errors
- Expo logs: App runtime errors

**Process**:
1. User reports issue ("Leaderboard doesn't update")
2. Check error logs in Sentry
3. Check Supabase logs for database errors
4. Check network tab in DevTools
5. Reproduce locally
6. Fix and deploy

---

## Security in Production

### HTTPS & API Security

**Enforced by default**:
- Supabase always uses HTTPS
- All requests encrypted in transit
- Domain verified (no MITM attacks)

### Rate Limiting

**Pattern**: Prevent abuse and DDoS

```
Examples:
- Create max 10 posts per day
- Like max 100 items per day
- Create max 1 competition per day

Implementation:
- PostgreSQL trigger counts actions per day
- If limit reached: Return error
- Frontend shows message: "Daily limit reached"
```

### Data Privacy

**Pattern**: Respect user privacy

```
Requirements:
- RLS policies enforce row-level access
- Delete user data on request (GDPR)
- Encrypt sensitive data (passwords hashed by Supabase)
- Don't log sensitive data (passwords, tokens)
```

---

## Deployment Checklist

### Before Building for Production

- [ ] All tests pass
- [ ] No console.log debugging statements
- [ ] Environment variables correct (prod Supabase)
- [ ] Version bumped in app.json
- [ ] RLS policies enabled on all tables
- [ ] Rate limiting configured
- [ ] Error logging configured (Sentry)
- [ ] Push notifications configured
- [ ] Deep linking tested
- [ ] Performance optimized (bundle size < 40MB)

### After Building

- [ ] APK generated successfully
- [ ] Test on real device (iOS/Android)
- [ ] Test offline scenarios
- [ ] Test slow network
- [ ] Check error logging (no crashes)
- [ ] Monitor user feedback
- [ ] Have rollback plan ready

### Post-Launch Monitoring

- [ ] Monitor crash rate
- [ ] Monitor API latency
- [ ] Monitor user engagement
- [ ] Monitor error logs for patterns
- [ ] Collect user feedback
- [ ] Plan next release cycle