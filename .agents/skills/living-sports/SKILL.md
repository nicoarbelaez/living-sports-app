---
name: living-sports-supabase-stack
description: Complete guide for building fullstack mobile applications with Expo, NativeWind v5, and Supabase for the Living Sports fitness social network. Use this skill whenever the user wants to build, optimize, or debug: PostgreSQL schemas optimized for fitness tracking, React Native frontends with NativeWind styling, authentication flows, real-time features, feed systems, workout competitions, user profiles, media uploads, API integrations, or production deployments with EAS. Triggers for any mention of Living Sports, Expo, NativeWind, Supabase, PostgreSQL performance, fitness app architecture, mobile optimization, or deployment questions.
compatibility:
  - Requires: Node.js 18+, Expo SDK 52+, React Native knowledge, TypeScript (recommended)
  - Deployment: EAS Build for APK generation only (testing phase, no Play Store)
  - Branches: main (production) and develop (development)
  - Tools: bash, create_file, str_replace, view
---

# Living Sports - Supabase Mobile Stack

Complete guide for building production-ready **fitness social network** with **Expo**, **NativeWind v5**, **PostgreSQL**, and **Supabase** on React Native.

This skill is organized into 5 specialized domains:

## 🎯 About Living Sports

**Living Sports** is a **fitness social network** for mobile (iOS/Android via Expo) where users:
- Upload workout videos/images to a **feed** (like Instagram for fitness)
- **Compete** with friends on exercises with real-time scoring
- Manage their **training routine/profile** with workout history
- Follow friends and engage in a fitness community

Key considerations:
- Media uploads (video compression, storage optimization)
- Real-time notifications (competitions, achievements)
- Feed pagination and infinite scroll
- Offline-first design (critical for mobile)
- Database schema designed for flexibility (expect frequent changes)

## 📋 Domain Organization

### 1. **Database & Architecture** (`references/database.md`)
- PostgreSQL schema design & best practices
- Performance optimization (indexing, partitioning, query optimization)
- Row-level security (RLS) policies
- Migrations and version control
- Supabase-specific features (realtime, vector embeddings)

**When to use**: Schema questions, performance issues, data modeling, RLS setup

### 2. **Frontend & UI Design** (`references/frontend.md`)
- React Native component architecture (Expo best practices)
- NativeWind v5 styling with global.css variable system
- Mobile-first responsive design
- Touch interactions and native gestures
- Accessibility (a11y) for mobile
- Form handling with state management
- Media handling (video/image upload, compression, caching)
- Feed infinite scroll and performance optimization
- Dark mode with OKLch color variables

**When to use**: Component design, NativeWind styling, mobile layouts, media handling, gesture interactions

### 3. **Authentication & Security** (`references/auth-security.md`)
- Supabase Auth flows (email, OAuth, MFA)
- Session management
- JWT token handling
- Security best practices
- Permission models and authorization

**When to use**: Auth implementation, permission setup, session issues, security hardening

### 4. **Integration & Deployment** (`references/integration-deployment.md`)
- API integration patterns
- Real-time subscriptions
- Environment configuration
- Deployment workflows (Vercel, Netlify, Docker)
- Monitoring and error handling
- CI/CD pipelines

**When to use**: Deployment questions, API integration, real-time setup, environment config

### 5. **Database Versioning & Schema Evolution** (`references/database.md`)
- Migration versioning strategy for evolving schema
- How to communicate schema changes without rewriting docs
- Pattern for flexible/denormalized schemas
- Handling breaking changes in production
- Testing schema changes before deployment

**When to use**: Planning DB changes, schema evolution, maintaining flexibility, handling breaking changes

1. **Clarify the task**: Database design? UI component? Auth? Media upload? Real-time feature?
2. **Consult the appropriate reference file** (see above)
3. **Follow step-by-step guidance** with code examples (React Native + NativeWind)
4. **Validate with test cases** or code review
5. **Deploy**: Push to develop branch → EAS Build generates APK for testing

---

## 📚 How to Navigate This Skill

- **For database questions**: Jump to `references/database.md` → Find relevant section → Apply patterns
- **For frontend/styling**: Jump to `references/frontend.md` → Review NativeWind approach → Build component
- **For auth flows**: Jump to `references/auth-security.md` → Select flow type → Implement
- **For deployment**: Jump to `references/integration-deployment.md` → Choose deployment target → Configure

---

## Key Principles

✅ **Mobile-first design**: Optimize for touch, gestures, and small screens from the start
✅ **Database-first design**: Structure your data correctly for fitness tracking, competitions, media
✅ **Security by default**: Always implement RLS, validate inputs, use environment variables
✅ **Offline resilience**: Cache data locally, sync when connection returns (critical for mobile)
✅ **Media optimization**: Compress videos/images, lazy-load feeds, paginate efficiently
✅ **Real-time ready**: Design schema for subscriptions (competitions, feed updates, notifications)
✅ **Performance matters**: Profile with Expo DevTools, optimize queries, lazy-load components
✅ **Schema flexibility**: Expect frequent DB changes; use JSONB for semi-structured data

---

## Common Workflows

### Building a Feed Feature (New)
1. Design PostgreSQL tables (posts, media, likes, comments)
2. Create migration with proper indexes
3. Set up RLS policies
4. Build React Native feed component with infinite scroll
5. Apply NativeWind styling with OKLch variables
6. Implement media upload with compression
7. Add real-time subscriptions for live updates
8. Test pagination and caching

### Building a Competition Feature (New)
1. Design tables (competitions, entries, scoring, leaderboards)
2. Create triggers for real-time score updates
3. Build real-time subscription in React Native
4. Create leaderboard component with NativeWind
5. Add notifications for achievements
6. Test edge cases (simultaneous scores, timeouts)

### Building a Training Profile
1. Design schema (workouts, exercises, routines, history)
2. Create visualization component (charts, progress)
3. Set up RLS for user privacy
4. Implement offline caching with AsyncStorage
5. Sync when connection returns
6. Add data export functionality

### Schema Evolution (Database Changes)
1. Create new migration file with version number
2. Apply safely with backward-compatible approach
3. Add JSONB columns for flexibility
4. Document changes in migration comments
5. Test on develop branch first
6. Deploy to main with monitoring

---

## Scripts & Tools

Check `scripts/` directory for automation helpers:
- `validate-schema.py` - Check PostgreSQL schema compliance
- `optimize-queries.js` - Analyze and suggest query optimizations
- `generate-component.js` - Scaffold React components with Tailwind

---

## Tips for Using This Skill

🎯 **Be specific**: "How do I optimize feed pagination?" is better than "my app is slow"
🎯 **Provide context**: Share schema snippets, component code, error messages, or mock data
🎯 **Reference sections**: Say "I'm looking at the media upload section" to help narrow down
🎯 **Schema changes**: Don't worry about explaining DB changes in detail—just say what you need, and I'll handle schema evolution patterns
🎯 **Ask for patterns**: "Show me the pattern for..." gets better results
🎯 **Mobile context**: Remember this is Expo/React Native, not web—gestures, offline sync, and media are key
🎯 **Branches**: develop branch is for testing with APK, main is production