---
title: Frontend Design with React Native & Expo
version: 1.0
---

# Frontend Design with React Native & Expo

Building fitness social network UI with native mobile performance, natural gestures, and responsive design.

## Table of Contents
1. [React Native Fundamentals](#react-native-fundamentals)
2. [NativeWind v5 & Styling System](#nativewind-v5--styling-system)
3. [Component Architecture](#component-architecture)
4. [Navigation Patterns](#navigation-patterns)
5. [Touch Gestures & Interactions](#touch-gestures--interactions)
6. [Media Handling](#media-handling)
7. [Feed & List Optimization](#feed--list-optimization)
8. [Forms & Input](#forms--input)
9. [Animations & Transitions](#animations--transitions)
10. [Accessibility for Mobile](#accessibility-for-mobile)
11. [Common Component Patterns](#common-component-patterns)

---

## React Native Fundamentals

### Core Concepts

React Native uses **native iOS and Android components** instead of DOM elements. No HTML, no CSS—just JavaScript managing native views.

```jsx
// ❌ Web React (won't work in Expo)
<div className="p-4 bg-blue-500">
  <h1>Title</h1>
  <p>Content</p>
</div>

// ✅ React Native (Expo compatible)
import { View, Text } from 'react-native';

<View className="p-4 bg-blue-500">
  <Text className="text-xl font-bold">Title</Text>
  <Text>Content</Text>
</View>
```

### Key Native Components

| Component | Purpose | Equivalent |
|-----------|---------|-----------|
| `View` | Container, layout | `<div>` |
| `Text` | Text content (must wrap text) | `<span>`, `<p>` |
| `ScrollView` | Scrollable container | `<div overflow-y>` |
| `FlatList` | Large lists, infinite scroll | `<ul>` with virtualization |
| `Image` | Display images | `<img>` |
| `TextInput` | Text input field | `<input>`, `<textarea>` |
| `TouchableOpacity` | Pressable button with opacity feedback | `<button>` with hover |
| `Modal` | Modal dialog (overlay) | `<dialog>` |
| `SafeAreaView` | Respects notches, safe areas | CSS safe-area |
| `ScrollView` | Scrollable container | `<div overflow-y>` |
| `FlatList` | Large lists with virtualization | Virtualized list |

---

## NativeWind v5 & Styling System

### Architecture

**All styling configuration is in `global.css`**. No modifications to `tailwind.config.js`.

```css
/* global.css */

@theme inline {
  --color-electric: var(--electric);
  --color-primary: var(--primary);
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-border: var(--border);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-error: var(--error);
}

:root {
  /* Living Sports Neon Green - Light Mode */
  --electric: oklch(57.082% 0.20825 277.543);
  
  /* Neutral Colors - Light */
  --primary: oklch(45% 0.15 251);
  --secondary: oklch(65% 0.08 251);
  --background: oklch(99% 0.001 0);
  --surface: oklch(96% 0.001 0);
  --text-primary: oklch(15% 0.01 0);
  --text-secondary: oklch(45% 0.01 0);
  --border: oklch(88% 0.002 0);
  
  /* Semantic Colors */
  --success: oklch(60% 0.15 142);
  --warning: oklch(70% 0.15 70);
  --error: oklch(55% 0.15 25);
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode values */
    --electric: oklch(48.616% 0.26687 270.727);
    --primary: oklch(60% 0.15 251);
    --background: oklch(12% 0.001 0);
    --surface: oklch(18% 0.001 0);
    --text-primary: oklch(95% 0.01 0);
    --text-secondary: oklch(70% 0.01 0);
    --border: oklch(25% 0.002 0);
    
    --success: oklch(65% 0.15 142);
    --warning: oklch(75% 0.15 70);
    --error: oklch(60% 0.15 25);
  }
}
```

### Using Styles in Components

```jsx
import { View, Text } from 'react-native';

// ✅ Use variable classes
<View className="bg-color-background p-4">
  <Text className="text-color-text-primary text-lg font-bold">Title</Text>
  <Text className="text-color-text-secondary text-sm mt-2">Subtitle</Text>
</View>

// ✅ Or use inline style with CSS variables
<View style={{ backgroundColor: `var(--surface)` }}>
  <Text style={{ color: `var(--text-primary)` }}>Content</Text>
</View>

// ✅ Responsive with breakpoints (for tablet)
<View className="p-4 sm:p-6 md:p-8">
  Adjusts padding on larger screens
</View>
```

### NativeWind Utility Classes for React Native

```jsx
// Spacing
<View className="p-4 m-2 pt-6 mb-3">Padding and margin</View>

// Colors
<View className="bg-color-background">
  <Text className="text-color-text-primary">Text</Text>
</View>

// Sizing
<View className="w-20 h-20">100% of width/height (40x40 units)</View>
<View className="w-full">Full width</View>

// Flexbox (default for View)
<View className="flex flex-row justify-between items-center gap-4">
  <View>Item 1</View>
  <View>Item 2</View>
</View>

// Borders
<View className="border border-color-border rounded-lg p-4">
  Card with border
</View>

// Shadow (platform-specific)
<View className="shadow-lg">Shadow</View>

// Opacity
<View className="opacity-50">50% transparent</View>

// Text alignment
<Text className="text-center text-lg font-bold">Centered heading</Text>

// Conditional classes (NativeWind v5)
<View className={`p-4 ${isActive ? 'bg-color-electric' : 'bg-color-surface'}`}>
  Conditional styling
</View>
```

---

## Component Architecture

### File Structure

```
components/
├── common/
│   ├── Button.tsx              # Touchable, handles press feedback
│   ├── Card.tsx                # Surface with border/shadow
│   ├── Input.tsx               # TextInput with validation
│   ├── Icon.tsx                # Vector icons (react-native-vector-icons)
│   └── SafeArea.tsx            # SafeAreaView wrapper
├── feed/
│   ├── FeedList.tsx            # FlatList with infinite scroll
│   ├── PostCard.tsx            # Individual post with image/video
│   ├── PostActions.tsx         # Like, comment, share buttons
│   └── PostMedia.tsx           # Image/video display with loading
├── competition/
│   ├── CompetitionCard.tsx     # Competition preview
│   ├── Leaderboard.tsx         # FlatList-based leaderboard
│   ├── ScoreEntry.tsx          # Form to log scores
│   └── CompetitionModal.tsx    # Bottom sheet (BottomSheetModal)
├── profile/
│   ├── ProfileHeader.tsx       # User info, avatar, stats
│   ├── WorkoutHistory.tsx      # List of past workouts
│   ├── AchievementBadges.tsx   # Grid of badges
│   └── EditProfile.tsx         # Profile update form
└── auth/
    ├── LoginForm.tsx           # Email/password login
    ├── SignupForm.tsx          # Registration form
    └── OAuthButton.tsx         # Sign in with Google/Apple
```

### Button Component Pattern

Buttons in React Native need proper feedback (no hover—use press states instead):

**Pattern**: Use `TouchableOpacity` or `Pressable` with ripple effect on Android.

Libraries: `react-native-gesture-handler` for better tap detection, press animation feedback.

Implementation approach:
- Wrap content in `Pressable` or `TouchableOpacity`
- Add `activeOpacity` (0.6-0.8) for visual feedback
- Handle `onPress` callback
- Show loading state during async operations
- Use NativeWind for styling variants (primary, secondary, disabled)

**No literal code here**—use the library's documentation for implementation.

### Card Component Pattern

Cards are containers with elevation, borders, or shadows.

**Pattern**: `View` with NativeWind border/shadow, padding, rounded corners.

Libraries: None required (native styles handle this).

Implementation approach:
- Use `View` with `className="bg-color-surface border border-color-border rounded-lg p-4 shadow-md"`
- Add padding inside for content
- Optional: Use `Pressable` wrapper for tap feedback on entire card
- Apply margin between cards in lists

---

## Navigation Patterns

### Stack Navigation (Auth Flow)

Pattern for auth screens: Login → Signup → Password Reset → App

Library: `@react-navigation/stack`

Implementation approach:
- Create "auth" stack with Login, Signup, ForgotPassword screens
- Create "app" stack with main tabs (Feed, Competitions, Profile)
- Switch between stacks based on auth state (from Supabase session)
- Use `linking` configuration for deep linking (notifications)
- Handle back button on Android

### Tab Navigation (Main App)

Pattern: Bottom tab bar with Feed, Competitions, Inbox, Profile

Library: `@react-navigation/bottom-tabs`

Implementation approach:
- Create tab navigator with 4-5 tabs
- Each tab is its own stack (allows nested navigation)
- Show badge notifications on Inbox/Notifications tab
- Icons from `react-native-vector-icons` (Feather, MaterialCommunityIcons)
- Use `screenOptions` to customize active/inactive colors with CSS variables
- Handle tab transitions smoothly

### Drawer Navigation (Menu)

Pattern: Side drawer for Settings, Help, Sign Out

Library: `@react-navigation/drawer`

Implementation approach:
- Optional drawer navigator at top level
- Combine with tab navigator (drawer contains tabs)
- Custom drawer content component (view profile, settings options)
- Close drawer on item press
- Add gesture from left edge to open (automatic with library)

### Deep Linking

Pattern: Tapping notification → Opens specific screen with data

Implementation approach:
- Define linking configuration in navigation container
- Handle URL patterns for feed posts, competitions, profiles
- Use `expo-linking` to open URLs from notifications
- Pass parameters through route.params
- Test with `npx expo start` and custom URL schemes

---

## Touch Gestures & Interactions

### Tap & Long Press

Pattern: Tap to navigate, long-press for context menu

Library: `react-native-gesture-handler` + `@react-navigation/native`

Implementation approach:
- Wrap interactive elements in `Pressable` (simpler) or `GestureDetector` (complex)
- Use `onLongPress` for context menus (long-press post → Edit/Delete options)
- Show visual feedback (opacity change or highlight)
- Cancel press if swipe detected (prevent accidental taps)

### Swipe Gestures

Pattern: Swipe down to close modal, swipe left for actions (delete post)

Library: `react-native-gesture-handler` + `react-native-reanimated`

Implementation approach:
- Use `PanGestureHandler` for swipe detection
- Animate view position based on swipe delta with Reanimated
- Snap to open/closed state when user releases
- Add threshold (min distance) before triggering action
- Test on both iOS and Android (different swipe sensitivities)

### Scroll Listeners

Pattern: Change header opacity based on scroll position, load more on scroll end

Library: Built-in `FlatList` callbacks + `react-native-reanimated` (for animations)

Implementation approach:
- Use `onScroll` prop on `FlatList` or `ScrollView` for position tracking
- Implement `onEndReached` for infinite scroll (load next page of feed)
- Add `onEndReachedThreshold` (load when 80% scrolled)
- Animate header fade/slide based on scroll offset
- Implement refresh control (pull-to-refresh) with `RefreshControl`

---

## Media Handling

### Image Upload & Compression

Pattern: User picks image from gallery → Compress → Upload to Supabase Storage

Libraries: `react-native-image-crop-picker` (gallery/camera) + `expo-image-manipulator` (compression)

Implementation approach:
- Trigger image picker on button press
- Allow crop/rotate before selection
- Get image URI locally
- Compress using `expo-image-manipulator` (resize to max width 800px, quality 0.7)
- Upload to Supabase Storage with progress tracking
- Store URL in database
- Handle upload cancellation and errors
- Show progress indicator during upload

### Video Handling

Pattern: Upload short workout video, display with thumbnail, allow playback

Libraries: `react-native-video` (playback) + `expo-av` (recording, optional)

Implementation approach:
- Capture or pick video from gallery
- Generate thumbnail (first frame or custom timestamp)
- Compress/transcode using `expo-av` or native tools
- Upload to Supabase Storage (may need custom server for video processing)
- Store video URL and thumbnail URL in database
- Display with play button overlay on thumbnail
- Stream video with pause/resume/progress controls
- Handle different video codecs (H.264, VP9, etc.)

### Image Caching & Lazy Loading

Pattern: Feed shows 20+ images, only load visible ones, cache for reuse

Libraries: `expo-image` (built into Expo, handles caching automatically) or `react-native-fast-image`

Implementation approach:
- Use `Image` or `expo-image` component
- Set image URI from database
- Let Expo handle disk caching automatically
- In `FlatList`, use `initialNumToRender={10}` to render only visible items
- Use `removeClippedSubviews={true}` for Android performance
- Add loading placeholder while image loads
- Handle image load errors gracefully (show placeholder)

---

## Feed & List Optimization

### Infinite Scroll Feed

Pattern: Show 10 posts → User scrolls to bottom → Load 10 more automatically

Library: `FlatList` (built-in React Native)

Implementation approach:
- Query posts with `LIMIT 10 OFFSET 0` initially
- In `FlatList` `onEndReached` callback, increment offset and fetch next page
- Append new posts to state array (don't replace)
- Use `onEndReachedThreshold={0.8}` to trigger fetch at 80% scroll
- Show loading indicator during fetch (append to list or center on screen)
- Handle duplicate posts (track cursor ID instead of offset, or deduplicate)
- Show "no more posts" message at end
- Add pull-to-refresh to reset feed

### Post Card Component

Pattern: Display post with image, user info, caption, action buttons

Implementation approach:
- Use `View` container with NativeWind for layout
- Display user avatar (small circular image), username, timestamp
- Show image/video with aspect ratio container
- Display caption text with expand/collapse if too long
- Action row: Like button (heart icon), Comment, Share, More options (three dots)
- Like button animates on press (Reanimated for scale/heart animation)
- Tap to navigate to comment screen or full post view
- Long-press for context menu (delete if owner, report, etc.)

### Pagination Patterns

**Offset-based** (simple, inefficient for large datasets):
- Use `LIMIT 10 OFFSET 20`
- Problem: Inefficient if data changes frequently

**Cursor-based** (efficient, stable):
- Query with `created_at < ${lastPostTimestamp}`
- Use `created_at DESC` to maintain order
- Better for social feeds (new posts don't shift older ones)
- Recommended for Living Sports

Implementation approach:
- Store last post's `created_at` timestamp in state
- On "load more", query where `created_at < :lastTimestamp`
- Deduplicate results (track post IDs in Set)
- Detect "no more posts" when result count < limit

---

## Forms & Input

### Form Validation Pattern

Libraries: `react-hook-form` (state management) + `zod` or `yup` (schema validation)

Implementation approach:
- Define schema with field types, required/optional, length, pattern rules
- Use `react-hook-form` to manage state and validation
- Show real-time validation errors as user types
- Disable submit button if form has errors
- Show error message below each field
- Handle async validation (check username availability)
- Submit handler validates schema before API call

### TextInput Component

Pattern: Single input field with validation, placeholder, error display

Implementation approach:
- Use native `TextInput` component
- Style with NativeWind classes (`p-3 border border-color-border rounded-lg`)
- Change border color to red on error
- Show error text below input
- Use `keyboardType` prop for mobile keyboard (email, number, etc.)
- Add `secureTextEntry` for password fields
- Use `onChangeText` for value updates
- Handle keyboard dismiss on submit
- Multi-line for longer inputs (textarea equivalent)

---

## Animations & Transitions

### Screen Transitions

Library: `@react-navigation/native` (built-in animations) or `react-native-reanimated` (custom)

Implementation approach:
- Navigation automatically animates screen entrance/exit
- Customize with `screenOptions.cardStyle` (slide, fade)
- No literal animation code needed—use navigation library's API

### Button Press Feedback

Pattern: Scale down and back up when pressed

Library: `react-native-reanimated` (or native `Animated` API)

Implementation approach:
- Use `Pressable` with `android_ripple` for Android (ripple effect)
- Use `Animated.Value` to scale button on `onPressIn`/`onPressOut`
- Or use `TouchableOpacity` with `activeOpacity` for simpler fade effect
- Keep animation under 150ms for snappy feel

### List Item Animations

Pattern: New post animates in from top, deleted post animates out

Library: `react-native-reanimated`

Implementation approach:
- Use `FlatList` with `ListHeaderComponent` for new posts
- Animate new item entrance with Reanimated
- On delete, animate item slide out + fade, then remove from list
- Keep animations brief (200-300ms) for responsive feel

### Bottom Sheet Modal

Pattern: Pop up from bottom (like Instagram story replies)

Library: `@react-native-menu/bottom-sheet` or `react-native-modal-bottom-sheet`

Implementation approach:
- Create modal component that slides up from bottom
- Handle swipe down to close (Reanimated + GestureHandler)
- Fill screen height with scrollable content if tall
- Blur background (use `react-native-blur`)
- Close on outside tap
- Test on both iOS (native gestures) and Android

---

## Accessibility for Mobile

### Screen Reader Support

Pattern: Describe buttons and images for visually impaired users

Implementation approach:
- Add `accessibilityLabel` to all interactive elements
- Describe images with `accessible={true}` + `accessibilityLabel`
- Use semantic component names (Button, not custom View)
- Test with screen reader enabled (iOS VoiceOver, Android TalkBack)

### Color Contrast

Pattern: Ensure text is readable on its background

Implementation approach:
- Use `--text-primary` for default text (already high contrast)
- Check color combinations against WCAG AA standards
- Test with color blindness simulator
- Use light/dark mode toggle to maintain contrast

### Touch Target Size

Pattern: Buttons must be at least 48x48 points for comfortable pressing

Implementation approach:
- Use `minHeight: 48` and `minWidth: 48` for buttons
- Add padding inside buttons for larger tap area
- Avoid small, hard-to-tap elements
- Space related buttons appropriately (not clustered)

### Focus Management

Pattern: Keyboard navigation in forms (Tab key on Android/iOS)

Implementation approach:
- Set `accessible={true}` on interactive elements
- Use `nextFocusDown`/`nextFocusRight` for manual focus flow
- Test with keyboard navigation enabled
- Announce form validation errors with `accessibilityLiveRegion`

---

## Common Component Patterns

### Header Component

Used on every screen to show title, back button, action buttons.

Pattern:
- `View` with fixed height (60-70 points)
- Left: Back button (or menu icon)
- Center: Screen title
- Right: Action button (settings icon, etc.)
- Safe area inset at top
- Sticky position (stays at top on scroll)

### FloatingActionButton (FAB)

Pattern: Round button in bottom-right corner for primary action (New Post, New Competition)

Implementation approach:
- Absolute positioned `View` with `position: absolute bottom-4 right-4`
- Use `TouchableOpacity` with circular shape (`w-14 h-14 rounded-full`)
- Add icon in center
- Show `+` icon or action-specific icon
- Optional: Show label tooltip on long-press
- Press to open action sheet (create post, competition, etc.)

### Loading Skeleton

Pattern: Gray placeholder while content loads

Implementation approach:
- Create repeated `View` elements with gray background
- Animate opacity/shimmer effect with Reanimated (optional)
- Replace with real content once loaded
- Improves perceived performance (user sees something loading)

### Empty State

Pattern: Show message when list is empty (no posts, no competitions)

Implementation approach:
- Check if array is empty
- Show centered `View` with icon, message, and action button
- Example: "No workouts yet. Create one to get started!" with button
- Use encouraging copy and illustrations

### Pull-to-Refresh

Pattern: Swipe down from top to reload feed

Implementation approach:
- Use `RefreshControl` component with `FlatList`
- Show loading spinner while refreshing
- Disable scroll during refresh
- Automatically hide after refresh completes
- Maintain scroll position (don't jump to top)

### Toast Notifications

Pattern: Small message at bottom (post published, error, etc.)

Libraries: `react-native-toast-message` or simple custom implementation

Implementation approach:
- Show brief notification on action (no modal, not blocking)
- Auto-dismiss after 3 seconds
- Different colors for success/error/info
- Stack multiple toasts or replace last one
- Bottom position (above FAB)

### Snackbar (for errors)

Pattern: Error message at bottom with action button (retry, dismiss)

Implementation approach:
- Similar to toast but with optional action button
- Stays visible longer or until dismissed
- Use for important messages (upload failed, connection lost)
- Position above keyboard if input visible

---

## Performance Tips

1. **Use `FlatList` for long lists**, not `ScrollView` with nested `View`
2. **Memoize components** that don't need frequent re-renders (`React.memo`)
3. **Lazy load images** (Expo handles this automatically with disk cache)
4. **Compress media** before upload (images: max 800px width; videos: transcode to H.264)
5. **Pagination/infinite scroll** instead of loading all at once
6. **Use `keyExtractor`** in `FlatList` to prevent re-rendering all items on data change
7. **Avoid inline functions** in render (define outside component)
8. **Profile with Expo Debugger** to identify bottlenecks
9. **Remove unused libraries** (check bundle size with `eas build --local`)
10. **Use `useCallback`** for handlers passed to memoized children

---

## Debugging Tips

- **Reload app**: Shake device (Expo) or `r` in terminal
- **Toggle inspector**: Shake device and tap "Toggle Element Inspector"
- **Network requests**: Use Chrome DevTools with Expo (`expo start --localhost`)
- **Performance**: Use React Profiler in DevTools
- **Video playback issues**: Check codec support on target devices
- **Image aspect ratio**: Always set explicit width/height on images
- **Gesture issues**: Check `react-native-gesture-handler` is configured in app.json
- **Styling not applied**: Verify NativeWind is installed and global.css is imported