---
title: Database Design & PostgreSQL for Living Sports
version: 1.0
---

# Database Design & PostgreSQL with Supabase

Designing PostgreSQL schemas optimized for fitness social networks, real-time features, and mobile access from Expo apps.

## Table of Contents
1. [Schema Design Principles](#schema-design-principles)
2. [Living Sports Core Tables](#living-sports-core-tables)
3. [Data Types & Constraints](#data-types--constraints)
4. [Indexing Strategy](#indexing-strategy)
5. [Performance Optimization](#performance-optimization)
6. [Row-Level Security (RLS)](#row-level-security-rls)
7. [Migrations & Versioning](#migrations--versioning)
8. [Real-Time Subscriptions](#real-time-subscriptions)
9. [Schema Evolution Patterns](#schema-evolution-patterns)
10. [Supabase-Specific Features](#supabase-specific-features)

---

## Schema Design Principles

### Normalization vs Denormalization

**Normalized approach** (recommended for Live Sports):
- Reduces redundancy (single source of truth for user info)
- Easier maintenance (update username once, reflected everywhere)
- JOIN queries handle relationships
- Best for transactional systems with frequent writes

Example: User info in `users` table, referenced by ID in `posts`, `competitions`, etc.

**Denormalized approach** (use sparingly with JSONB):
- Faster reads (no JOINs needed)
- Requires cache invalidation (triggers)
- Use for computed fields (like count, score, etc.)
- Best for read-heavy analytics or semi-structured data

Example: Store user's current competition score in JSONB `user_metadata` instead of querying leaderboard each time.

**Best practice**: Start normalized, denormalize only proven bottlenecks. Use JSONB for flexibility.

### Primary Key Strategy

**UUIDs** (recommended):
- Perfect for distributed systems (Supabase)
- Works with mobile (no sequential IDs from server)
- Good for privacy (IDs aren't predictable)

**BIGINT auto-increment**:
- Simpler for some use cases
- Sequential (exposes data volume)
- Less suitable for distributed systems

**For Living Sports**: Use UUIDs for all tables except internal tracking.

### Timestamp Best Practices

Always include `created_at` and `updated_at` for auditing and sorting:
- `created_at`: Set once, never changes
- `updated_at`: Auto-updates on any change (via trigger)
- Use `TIMESTAMP WITH TIME ZONE` for UTC
- Use for feed sorting (newest first), pagination, etc.

---

## Living Sports Core Tables

### 1. Users Profile

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  
  -- Semi-structured: Training level, preferences, achievements, stats
  profile_data JSONB DEFAULT '{}',  -- { level: 'beginner', favoriteExercises: [...], badges: [...] }
  
  -- Settings stored as JSON (notifications, privacy, theme)
  settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created ON users(created_at DESC);
```

**Why JSONB for profile_data?**
- Add new fields without migration (e.g., "favoriteExercises", "achievements")
- Track achievements as they're earned
- Store training level history
- Flexible without schema changes

### 2. Feed Posts

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  caption TEXT,
  
  -- Store URLs of media uploaded to Supabase Storage
  media_urls TEXT[] DEFAULT '{}',
  
  -- Meta: tags, exercises, location, intensity
  metadata JSONB DEFAULT '{}',  -- { exercises: ['running', 'burpees'], intensity: 'high', location: 'gym' }
  
  likes_count INT DEFAULT 0,  -- Denormalized for speed
  comments_count INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for feed queries (user's posts, recent posts)
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_updated ON posts(updated_at DESC);  -- For "what's new"
```

**Performance notes**:
- `likes_count` and `comments_count` are denormalized (cached). Use triggers to update.
- `media_urls` array for multiple photos per post
- `metadata` JSONB for flexible exercise tagging

### 3. Likes & Interactions

```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(post_id, user_id)  -- User can't like same post twice
);

CREATE INDEX idx_post_likes_user ON post_likes(user_id, created_at DESC);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
```

**When user likes a post**:
- Insert into `post_likes`
- Trigger increments `posts.likes_count`
- Realtime subscription notifies post owner

### 4. Comments

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_comments_post_created ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Trigger to update post's comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
```

### 5. Competitions

```sql
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  exercise_type TEXT NOT NULL,  -- 'running_distance', 'pushups', 'burpees', etc.
  
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Scoring rules stored as JSON
  rules JSONB DEFAULT '{}',  -- { type: 'highest_score', unit: 'kilometers', target: 10 }
  
  is_public BOOLEAN DEFAULT true,  -- Private competitions for friend groups
  
  participants_count INT DEFAULT 1,  -- Denormalized
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX idx_competitions_creator ON competitions(creator_id);
CREATE INDEX idx_competitions_public ON competitions(is_public) WHERE is_public = true;
```

### 6. Competition Entries (Participant Scores)

```sql
CREATE TABLE competition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  current_score INT DEFAULT 0,  -- Latest/best score
  
  -- All attempts with timestamps (flexible storage)
  attempts JSONB NOT NULL DEFAULT '[]',  -- [{ timestamp: '2024-04-01T10:00Z', value: 5.2, unit: 'km' }, ...]
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(competition_id, user_id)  -- User participates once per competition
);

-- Leaderboard query: ORDER BY current_score DESC
CREATE INDEX idx_competition_leaderboard ON competition_entries(competition_id, current_score DESC);
CREATE INDEX idx_competition_user ON competition_entries(user_id);
```

**Why JSONB for attempts?**
- Store full history (timestamp, value, notes, device info)
- Flexible structure per competition type
- No need for separate `attempts` table
- Easy to query latest N attempts

### 7. Workouts & Training

```sql
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name TEXT,  -- "Upper Body", "5K Run", etc.
  
  -- Exercises stored as JSON (flexible structure)
  exercises JSONB NOT NULL DEFAULT '[]',  -- [{ name: 'pushups', sets: 3, reps: 10, weight: null }, ...]
  
  duration_minutes INT,
  intensity_level TEXT,  -- 'low', 'moderate', 'high'
  
  metadata JSONB DEFAULT '{}',  -- { location: 'gym', weather: 'sunny', mood: 'energized' }
  
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Query user's workouts chronologically
CREATE INDEX idx_workout_user_date ON workout_sessions(user_id, completed_at DESC);
CREATE INDEX idx_workout_completed ON workout_sessions(completed_at DESC);
```

### 8. Followers / Social Graph

```sql
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(follower_id, following_id),  -- User can't follow same person twice
  CHECK (follower_id != following_id)  -- Can't follow yourself
);

-- Query: "Who does user X follow?" / "Who follows user Y?"
CREATE INDEX idx_followers_follower ON followers(follower_id);
CREATE INDEX idx_followers_following ON followers(following_id);
```

---

## Data Types & Constraints

### Key Data Types for Fitness App

```sql
-- UUID for IDs
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Strings with length constraints
username VARCHAR(50) NOT NULL UNIQUE  -- Reasonable limit
bio VARCHAR(500)                      -- Bio with max length

-- Numbers
duration_minutes INT CHECK (duration_minutes > 0)  -- Must be positive
current_score INT DEFAULT 0           -- Scores can't be negative

-- JSONB for flexible data
attempts JSONB DEFAULT '[]'           -- Array of attempts with varying structure
profile_data JSONB DEFAULT '{}'       -- Flexible user data

-- Arrays for simple lists
media_urls TEXT[] DEFAULT '{}'        -- List of image/video URLs
tags TEXT[] DEFAULT '{}'              -- List of tag strings

-- Enums for fixed values
CREATE TYPE intensity_level AS ENUM ('low', 'moderate', 'high');
intensity intensity_level DEFAULT 'moderate'  -- Smaller, faster than TEXT

-- Timestamps
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()

-- Booleans for flags
is_public BOOLEAN DEFAULT true
is_active BOOLEAN DEFAULT true
```

---

## Indexing Strategy

### When to Index

```sql
-- ✅ Frequently filtered columns
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id);

-- ✅ Pagination queries (sorted columns)
CREATE INDEX idx_workouts_user_date ON workout_sessions(user_id, completed_at DESC);

-- ✅ Leaderboard / top N queries
CREATE INDEX idx_competition_leaderboard ON competition_entries(competition_id, current_score DESC);

-- ✅ Partial index (only public competitions)
CREATE INDEX idx_competitions_public ON competitions(is_public) WHERE is_public = true;

-- ✅ JSONB key searches (if querying frequently)
CREATE INDEX idx_posts_exercise ON posts USING gin(metadata);

-- ❌ Don't index: Low-cardinality (is_public = 95% true), rarely-used columns, foreign keys already indexed
```

### Naming Convention

Pattern: `idx_[table]_[columns]`

```sql
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_competition_leaderboard ON competition_entries(competition_id, current_score DESC);
```

---

## Performance Optimization

### Query Optimization: N+1 Problem

❌ **Avoid**: App loads 20 posts, then for each post fetches user info (21 queries)

✅ **Do**: Fetch posts with user info in one query via JOIN or Supabase `select` with relations

Example Supabase pattern:
```javascript
const { data } = await supabase
  .from('posts')
  .select('*, users(username, avatar_url)')  // Join users info
  .order('created_at', { ascending: false })
  .limit(20);
```

### Pagination Strategy

**Offset-based** (inefficient for large datasets):
- Query: `OFFSET 100 LIMIT 20` (skip 100, take 20)
- Problem: Slow with large offsets, unstable if data changes
- Acceptable for small datasets only

**Cursor-based** (recommended for feeds):
- Query: `WHERE created_at < ${lastPostTimestamp} LIMIT 20`
- Efficient: Constant performance regardless of position
- Stable: New posts don't affect pagination
- Better for mobile (unpredictable network drops)

Implementation in Expo app:
- Store `lastCreatedAt` timestamp in state
- On "load more", query `WHERE created_at < :lastCreatedAt ORDER BY created_at DESC LIMIT 20`
- Append results to feed
- Update `lastCreatedAt` to new batch's oldest timestamp

### Aggregation Caching

❌ **Avoid**: Recalculate `COUNT(*)` every time

✅ **Do**: Denormalize with trigger

```sql
-- Store count in posts table
ALTER TABLE posts ADD COLUMN likes_count INT DEFAULT 0;

-- Trigger to keep in sync
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_post_likes
AFTER INSERT ON post_likes
FOR EACH ROW EXECUTE FUNCTION increment_likes_count();
```

### Full-Text Search (Finding Exercises, Users)

For searching by username, exercise type, or post content:

```sql
-- Add tsvector column for fast text search
ALTER TABLE users ADD COLUMN search_vector tsvector;

-- Trigger to auto-update
CREATE OR REPLACE FUNCTION update_user_search()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.username || ' ' || COALESCE(NEW.display_name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_search_update
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_user_search();

-- Index for fast queries
CREATE INDEX idx_users_search ON users USING gist(search_vector);

-- Query: Find users matching "john"
SELECT * FROM users 
WHERE search_vector @@ plainto_tsquery('english', 'john')
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'john')) DESC
LIMIT 20;
```

---

## Query Organization & Service Layer

### Philosophy: Separate by Context

Instead of scattered Supabase queries throughout your Expo app, organize all database queries into service files by **context** or **domain**. This keeps code maintainable, testable, and easy to refactor.

**Benefits**:
- Single source of truth for queries
- Easy to refactor queries without touching components
- Reusable query logic across screens
- Type-safe with TypeScript
- Testable query functions
- Clear dependencies

### File Structure Pattern

```
lib/
├── supabase.ts                  ← Supabase client initialization
│
└── services/                    ← Query functions organized by domain
    ├── users/
    │   ├── index.ts            ← Export all user queries
    │   ├── profile.ts          ← Profile-related queries
    │   ├── auth.ts             ← Auth-related queries
    │   ├── follows.ts          ← Follow/social queries
    │   └── search.ts           ← User search queries
    │
    ├── posts/
    │   ├── index.ts
    │   ├── feed.ts             ← Feed queries (list, pagination)
    │   ├── interactions.ts     ← Like, comment queries
    │   └── media.ts            ← Media upload queries
    │
    ├── competitions/
    │   ├── index.ts
    │   ├── leaderboard.ts      ← Leaderboard queries
    │   ├── entries.ts          ← Entry submission queries
    │   └── create.ts           ← Competition creation queries
    │
    └── workouts/
        ├── index.ts
        ├── sessions.ts         ← Workout session queries
        └── history.ts          ← Training history queries

utils/
├── errors.ts                    ← Error handling utilities
├── pagination.ts               ← Cursor-based pagination helpers
├── transformers.ts             ← Data transformation helpers
└── validators.ts               ← Input validation helpers
```

### Service Pattern Example: Users Domain

#### users/auth.ts
```
Purpose: Authentication-related queries (login, signup, logout)

Pattern:
- signUpUser(email, password, display_name)
  → Call supabase.auth.signUp()
  → Create user profile in users table
  → Return user object

- loginUser(email, password)
  → Call supabase.auth.signInWithPassword()
  → Fetch user profile
  → Return session + user

- logoutUser()
  → Call supabase.auth.signOut()
  → Clear local cache
  → Return success
```

#### users/profile.ts
```
Purpose: Profile CRUD operations

Pattern:
- getUserProfile(userId: UUID)
  → Query users table WHERE id = userId
  → Include denormalized counts (followers, posts)
  → Return user profile

- updateUserProfile(userId: UUID, data)
  → Update users table
  → Validate input (username uniqueness, length)
  → Return updated user

- getUserStats(userId: UUID)
  → COUNT posts, COUNT followers, SUM workout_duration
  → Return stats object
```

#### users/follows.ts
```
Purpose: Social following queries

Pattern:
- followUser(followerId, followingId)
  → INSERT into followers table
  → Increment following_count denormalized column
  → Return success

- unfollowUser(followerId, followingId)
  → DELETE from followers table
  → Decrement following_count
  → Return success

- getFollowers(userId)
  → Query followers WHERE following_id = userId
  → JON with users table for profile info
  → Return array of follower profiles
```

#### users/search.ts
```
Purpose: Search users by username/name

Pattern:
- searchUsers(query: string, limit: 20)
  → Query users WHERE search_vector matches query
  → Order by relevance rank
  → Return limited results

- getUserSuggestions(userId)
  → Find users not yet followed
  → Order by mutual followers
  → Return suggestions
```

### Service Pattern Example: Posts Domain

#### posts/feed.ts
```
Purpose: Feed queries (initial load + pagination)

Pattern:
- getFeed(userId: UUID, limit: 20)
  → Query posts WHERE user_id in (people user follows) OR user_id = userId
  → Order by created_at DESC
  → Include user info (JOIN)
  → Include like/comment counts
  → Return posts array + pagination cursor

- getFeedPaginated(userId, cursor, limit)
  → Query posts WHERE created_at < cursor
  → Use cursor-based pagination
  → Return next batch

- getUserPosts(userId, limit, cursor)
  → Query posts WHERE user_id = userId
  → Cursor-based pagination
  → Return user's posts
```

#### posts/interactions.ts
```
Purpose: Like and comment queries

Pattern:
- likePost(postId, userId)
  → INSERT into post_likes
  → Trigger increments posts.likes_count
  → Return success

- unlikePost(postId, userId)
  → DELETE from post_likes
  → Trigger decrements likes_count
  → Return success

- addComment(postId, userId, text)
  → INSERT into comments
  → Trigger increments posts.comments_count
  → Return comment

- getPostComments(postId, limit, cursor)
  → Query comments WHERE post_id = postId
  → Include user info
  → Cursor-based pagination
  → Return comments
```

#### posts/media.ts
```
Purpose: Media upload and storage queries

Pattern:
- uploadPostMedia(userId, file)
  → Upload file to Supabase Storage (/posts/{userId}/{uuid})
  → Get public URL
  → Return { url, path }

- createPost(userId, caption, mediaUrls, metadata)
  → Validate input
  → INSERT into posts with media_urls array
  → Trigger updates user's post_count
  → Return created post

- deletePost(postId, userId)
  → Verify ownership (RLS handles)
  → DELETE post
  → Trigger decrements user's post_count
  → Return success
```

### Service Pattern Example: Competitions Domain

#### competitions/leaderboard.ts
```
Purpose: Leaderboard queries for real-time competitions

Pattern:
- getLeaderboard(competitionId)
  → Call PostgreSQL function get_leaderboard(competition_id)
  → Returns ranked list with scores
  → Include current user rank highlight
  → Return leaderboard

- subscribeToLeaderboard(competitionId)
  → Create Supabase realtime subscription
  → Listen to UPDATE events on competition_entries
  → Call local state updater
  → Return unsubscribe function

- getUserCompetitionRank(competitionId, userId)
  → Query competition_entries for user
  → Count how many scores are higher
  → Calculate rank
  → Return rank
```

#### competitions/entries.ts
```
Purpose: Competition entry (participant) queries

Pattern:
- joinCompetition(competitionId, userId)
  → INSERT into competition_entries
  → Set current_score = 0, attempts = []
  → Increment competitions.participants_count
  → Return entry

- submitScore(entryId, score)
  → UPDATE competition_entries SET current_score = score
  → APPEND to attempts JSONB array with timestamp
  → Trigger may recalculate rank
  → Realtime publishes update
  → Return updated entry

- getCompetitionEntries(competitionId)
  → Query competition_entries WHERE competition_id = competitionId
  → Order by current_score DESC
  → Include user profiles
  → Return entries
```

### Utility Helpers

#### utils/pagination.ts
```
Purpose: Helper functions for cursor-based pagination

Pattern:
- getCursorFromItem(item)
  → Extract created_at timestamp from item
  → Return as cursor

- buildPaginationQuery(query, cursor, limit)
  → Add WHERE created_at < cursor clause if cursor exists
  → Add LIMIT clause
  → Return modified query

- isLastPage(items, limit)
  → Return items.length < limit
  → Indicates no more data
```

#### utils/errors.ts
```
Purpose: Standardized error handling

Pattern:
- handleSupabaseError(error)
  → Check error type (network, auth, RLS, validation)
  → Map to user-friendly message
  → Return { code, message, retry: boolean }

Example errors:
- 'auth/invalid-credentials' → "Invalid email or password"
- 'auth/user-not-found' → "Email not registered"
- 'permission-denied' → "You don't have access"
- 'network-error' → "No internet connection"
```

#### utils/validators.ts
```
Purpose: Input validation before querying

Pattern:
- validateUsername(username)
  → Check length 3-20 chars
  → Check alphanumeric + underscore
  → Return true/error message

- validateEmail(email)
  → Regex validation
  → Return true/error message

- validatePostCaption(caption)
  → Check max 500 chars
  → Return true/error message
```

### Component Usage Pattern

Instead of:
```
❌ WRONG: Query in component

function FeedScreen() {
  useEffect(() => {
    const { data } = await supabase
      .from('posts')
      .select('*, users(username)')
      .order('created_at', { ascending: false })
      .limit(20);
  }, []);
}
```

Do:
```
✅ CORRECT: Use service layer

import { postService } from '../../lib/services/posts';

function FeedScreen() {
  const [feed, setFeed] = useState([]);
  
  useEffect(() => {
    const loadFeed = async () => {
      const posts = await postService.feed.getFeed(userId, 20);
      setFeed(posts);
    };
    loadFeed();
  }, [userId]);
}
```

### Testing Service Queries

Pattern: Test queries independently from components

```
Example test structure:
- services/users/__tests__/profile.test.ts
  → Test getUserProfile returns user object
  → Test updateUserProfile validates input
  → Test error handling
  → Mock supabase client

Benefits:
- Catch query bugs before they reach components
- Easier to refactor queries
- Document expected behavior
```

### Service Layer Best Practices

1. **One function, one responsibility**
   - `getUserProfile()` gets user profile, doesn't modify
   - `updateUserProfile()` only updates, doesn't fetch
   - `followUser()` handles follow logic only

2. **Consistent naming**
   - `get*()` for queries (read)
   - `create*()` for inserts
   - `update*()` for updates
   - `delete*()` for deletes
   - `list*()` for array results
   - `search*()` for search operations

3. **Handle pagination at service level**
   - Service knows about cursors
   - Components don't need to understand pagination logic
   - Easy to swap pagination strategy

4. **Centralize error handling**
   - All services throw/handle same error format
   - Components use consistent error handling

5. **Organize by domain, not operation type**
   - `services/posts/` not `services/queries/`, `services/mutations/`
   - Easier to find related code

---

## Row-Level Security (RLS)

### Basic Setup

```sql
-- Enable RLS on sensitive tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ✅ Users see their own posts and public posts
CREATE POLICY view_posts ON posts
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_public = true  -- If posts have is_public flag
  );

-- ✅ Users can only insert posts for themselves
CREATE POLICY insert_own_posts ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ✅ Users can only update their own posts
CREATE POLICY update_own_posts ON posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ✅ Users can only delete their own posts
CREATE POLICY delete_own_posts ON posts
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Advanced RLS: Competition Entries

```sql
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;

-- ✅ Public competitions: Anyone can view leaderboard
-- ✅ Private competitions: Only participants can view
CREATE POLICY view_competition_entries ON competition_entries
  FOR SELECT
  USING (
    -- View own entries
    auth.uid() = user_id OR
    -- View public competition leaderboard
    EXISTS (
      SELECT 1 FROM competitions c
      WHERE c.id = competition_entries.competition_id
      AND c.is_public = true
    ) OR
    -- View private competition only if participant
    EXISTS (
      SELECT 1 FROM competition_entries ce
      WHERE ce.competition_id = competition_entries.competition_id
      AND ce.user_id = auth.uid()
    )
  );

-- ✅ Users can only enter/update their own entries
CREATE POLICY insert_competition_entry ON competition_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_competition_entry ON competition_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Testing RLS

In Supabase dashboard or with Supabase client:
```javascript
// Simulate as specific user
const { data } = await supabase
  .from('posts')
  .select('*');
// Will only return user's own posts or public posts

// Switch user context to verify policies
```

---

## Migrations & Versioning

### Migration File Structure

```
migrations/
├── 001_create_users_table.sql
├── 002_create_posts_table.sql
├── 003_create_likes_table.sql
├── 004_create_competitions_table.sql
├── 005_add_rls_policies.sql
├── 006_create_triggers_for_counts.sql
├── 007_add_search_index.sql
└── 008_add_offline_sync_columns.sql
```

### Safe Migration Patterns

**Adding new columns** (safe):
```sql
ALTER TABLE users ADD COLUMN badges JSONB DEFAULT '{}';
```

**Adding JSONB for flexibility** (safe):
```sql
ALTER TABLE posts ADD COLUMN exercise_metadata JSONB DEFAULT '{}'
-- Future: No need to migrate to add new exercise fields
```

**Renaming columns** (safe but careful):
```sql
ALTER TABLE users RENAME COLUMN old_name TO new_name;
```

**Deleting columns** (use with care):
- May break existing apps if they try to query deleted column
- Deprecate first: Rename to `_deprecated`, communicate with clients
- Delete in later migration after clients updated

**Creating indexes** (safe, improves performance):
```sql
CREATE INDEX idx_posts_created ON posts(created_at DESC);
```

### Supabase CLI Workflow

```bash
# Generate empty migration file
supabase migration new add_new_table

# Edit migration file with SQL

# Test locally
supabase migration up

# Rollback if needed
supabase migration down

# Deploy to Supabase cloud
supabase db push
```

---

## Real-Time Subscriptions

### Enable Realtime on Tables

```sql
-- Tell Supabase to stream changes on these tables
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE competition_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;

-- (optional) Limit events to INSERT/UPDATE only (no DELETE)
ALTER PUBLICATION supabase_realtime 
SET (publish = 'INSERT,UPDATE') 
FOR TABLE posts;
```

### Using in Expo App

Pattern: Subscribe to competition leaderboard for real-time updates

Implementation approach:
- Set up Supabase Realtime listener in component (useEffect)
- Subscribe to `competition_entries` table where competition_id matches
- On INSERT/UPDATE, update local state
- Unsubscribe on component unmount
- Handle network disconnects (listener auto-reconnects)
- Show "live" indicator when connected

No literal code—use Supabase JS client's `on('*', callback)` pattern.

---

## Schema Evolution Patterns

### Problem: Schema Changes Break Apps

When you change schema (add column, new table), running apps might:
- Crash if they expect old structure
- Fail silently if they don't handle missing fields
- Need careful migration strategy

### Solution: JSONB for Flexibility

Instead of creating new tables constantly, use JSONB:

```sql
-- Instead of: profile_headline, profile_bio, profile_level (3 columns)
-- Use:
CREATE TABLE users (
  profile_data JSONB DEFAULT '{}',
  -- Can hold any structure:
  -- { headline: "Marathon runner", bio: "...", level: "advanced", achievements: [...] }
);
```

**Migration-free evolution**:
```javascript
// App v1: stores { bio: "...", level: "..." }
// App v1.1: adds { headline: "...", achievements: [...] }
// No database migration needed—both versions work
```

### Strategy: Versioned Migrations

For structural changes that need migration:

```sql
-- migrations/009_add_training_routines.sql
-- Version: 2024-04-01
-- Breaking changes: None (additive only)

CREATE TABLE training_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_training_routines_user ON training_routines(user_id);

-- Track schema version
INSERT INTO schema_versions (version, applied_at, description)
VALUES (9, now(), 'Add training_routines table');
```

### Backward Compatibility Checklist

- [ ] New columns have defaults or are nullable
- [ ] Don't delete columns (deprecate with `_deprecated` suffix first)
- [ ] New tables are optional (don't require changes in app code)
- [ ] RLS policies handle both old and new data
- [ ] Migrations are reversible (keep `DOWN` scripts)
- [ ] Test with older app versions accessing new schema

---

## Supabase-Specific Features

### Vector Embeddings (AI Search)

For semantic search ("find workouts similar to this one"):

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column
ALTER TABLE posts ADD COLUMN embedding vector(1536);

-- Index for fast similarity search
CREATE INDEX idx_posts_embedding ON posts USING ivfflat (embedding vector_cosine_ops);

-- Query similar posts
SELECT id, caption,
  1 - (embedding <=> $1::vector) as similarity
FROM posts
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

In Expo app: Generate embeddings via Edge Function, send to DB, query for recommendations.

### PostgreSQL Functions as APIs

Define functions that apps call directly:

```sql
-- Function: Get leaderboard for a competition
CREATE OR REPLACE FUNCTION get_leaderboard(competition_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  score INT,
  rank INT
) AS $$
  SELECT 
    ce.user_id,
    u.username,
    ce.current_score,
    ROW_NUMBER() OVER (ORDER BY ce.current_score DESC) as rank
  FROM competition_entries ce
  JOIN users u ON ce.user_id = u.id
  WHERE ce.competition_id = get_leaderboard.competition_id
  ORDER BY ce.current_score DESC;
$$ LANGUAGE sql;

-- Call from Expo app:
-- const { data } = await supabase.rpc('get_leaderboard', { competition_id: 'xxx' })
```

### Database Webhooks

Trigger external actions on data changes:

Example: When user joins competition, send push notification to friends.

Setup in Supabase dashboard:
- Create webhook on `competition_entries` INSERT
- POST to your backend
- Backend queries DB and sends notifications

---

## Common Performance Pitfalls

| Issue | Problem | Solution |
|-------|---------|----------|
| N+1 queries | App fetches 20 posts, then 20 user queries | Use JOIN/relations in Supabase select |
| No indexes | Slow WHERE/ORDER BY | Index filtered/sorted columns |
| Offset pagination | Slow for large offsets (skip 10000 rows) | Use cursor-based pagination |
| Missing RLS | Data leaks between users | Enable RLS on sensitive tables |
| DECIMAL as TEXT | Sorting/math fails | Use INT for cents or NUMERIC(10,2) |
| Denormalized without triggers | Counts go out of sync | Use triggers to auto-update |
| JSON instead of JSONB | Slower queries on JSON data | Use JSONB for indexing |
| Too many triggers | Database becomes slow | Batch updates, use efficient trigger logic |

---

## Quick Checklist

- [ ] All tables have UUID primary keys
- [ ] All tables have `created_at` and `updated_at` timestamps
- [ ] Foreign keys set `ON DELETE CASCADE` for cleanup
- [ ] Indexes on frequently filtered/sorted columns
- [ ] RLS enabled on sensitive tables (posts, competition_entries, users)
- [ ] Denormalized counts use triggers to stay in sync
- [ ] JSONB used for flexible/semi-structured data
- [ ] Migrations are versioned and reversible
- [ ] Real-time publication enabled for live features
- [ ] Full-text search indexed for user/post search
- [ ] Tested pagination with realistic data volume
- [ ] Performance profiled with EXPLAIN ANALYZE