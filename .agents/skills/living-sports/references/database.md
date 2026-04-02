---
title: Database Design & PostgreSQL Optimization
version: 1.0
---

# Database Design & PostgreSQL with Supabase

## Table of Contents
1. [Schema Design Principles](#schema-design-principles)
2. [Data Types & Constraints](#data-types--constraints)
3. [Indexing Strategy](#indexing-strategy)
4. [Performance Optimization](#performance-optimization)
5. [Row-Level Security (RLS)](#row-level-security-rls)
6. [Migrations & Versioning](#migrations--versioning)
7. [Supabase-Specific Features](#supabase-specific-features)

---

## Schema Design Principles

### 1. Normalization vs Denormalization

**Normalized approach** (3NF):
- Reduces data redundancy
- Easier to maintain
- May require JOINs (slightly slower)
- Best for: Transactional systems, complex relationships

```sql
-- ✅ Normalized
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

**Denormalized approach**:
- Stores computed data explicitly
- Faster reads
- Requires careful cache invalidation
- Best for: Read-heavy analytics, denormalization at scale

```sql
-- ⚠️ Denormalized (use triggers to keep in sync)
CREATE TABLE posts_with_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  tag_count INT DEFAULT 0,  -- Denormalized
  view_count INT DEFAULT 0,  -- Denormalized
  updated_at TIMESTAMP DEFAULT now()
);
```

**Best practice**: Start normalized, denormalize only if profiling shows it's necessary.

---

### 2. Primary Key Strategy

```sql
-- ✅ UUIDs (recommended for Supabase/distributed systems)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- ✅ BIGINT auto-increment (good for simple apps)
CREATE TABLE items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ...
);

-- ✅ ULID (trendy, sortable, non-random)
-- Requires pgcrypto or custom function
CREATE TABLE items (
  id TEXT PRIMARY KEY DEFAULT gen_ulid(),
  ...
);

-- ❌ Avoid: String keys unless necessary
-- ❌ Avoid: Natural keys (email as PK) - they change
```

---

### 3. Timestamp Best Practices

```sql
-- ✅ Current setup (UTC, immutable)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ⚠️ Missing timezone (assume UTC in documentation)
CREATE TABLE posts (
  created_at TIMESTAMP DEFAULT now()
);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Data Types & Constraints

### Recommended Data Types

```sql
-- ✅ Strings
CREATE TABLE posts (
  title VARCHAR(255) NOT NULL,  -- Limited length, good for titles
  content TEXT NOT NULL,         -- Unlimited, good for content
  slug VARCHAR(255) UNIQUE,      -- For URLs
  description VARCHAR(500)       -- Bio/summary
);

-- ✅ Numbers
CREATE TABLE products (
  price NUMERIC(10, 2) NOT NULL,  -- Precise decimals (NOT float)
  stock INT NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2)             -- 0-99.99
);

-- ✅ Booleans
CREATE TABLE users (
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false
);

-- ✅ JSON
CREATE TABLE user_metadata (
  id UUID PRIMARY KEY,
  profile_data JSONB NOT NULL,     -- Better indexing than JSON
  settings JSONB DEFAULT '{}'::JSONB
);

-- ✅ Arrays
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  scores INT[] NOT NULL
);

-- ✅ Enums (smaller, faster than strings)
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE users (
  role user_role DEFAULT 'user'
);

-- ✅ UUID
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
```

### Constraints to Use

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  age INT CHECK (age >= 0 AND age <= 150),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  
  -- Foreign key with cascade
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- ✅ Constraint naming (important for migrations)
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Indexing Strategy

### When to Index

```sql
-- ✅ Index on frequently filtered columns
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- ✅ Composite index for common queries
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- ✅ Index for LIKE/search (use gin for full-text)
CREATE INDEX idx_posts_title ON posts USING gin(title gin_trgm_ops);

-- ✅ Index on JSON keys
CREATE INDEX idx_metadata_type ON items USING gin(profile_data);

-- ✅ Partial index (only active users)
CREATE INDEX idx_active_users ON users(id) WHERE is_active = true;

-- ❌ Don't index low-cardinality columns (gender, country)
-- ❌ Don't index every column
-- ❌ Don't index columns that are rarely queried
```

### Index Naming Convention

```sql
-- Table: posts
-- Pattern: idx_[table]_[columns]

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);

-- For unique constraints
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

---

## Performance Optimization

### 1. Query Optimization

```sql
-- ❌ N+1 Problem (avoid!)
-- In app: for each user { SELECT * FROM posts WHERE user_id = ... }

-- ✅ JOIN instead
SELECT u.id, u.name, p.title, p.created_at
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
ORDER BY u.id, p.created_at DESC;

-- ✅ Use EXPLAIN ANALYZE to check query plan
EXPLAIN ANALYZE
SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10;
```

### 2. Pagination

```sql
-- ✅ OFFSET/LIMIT (simple but slow for large offsets)
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 40;

-- ✅✅ Cursor-based pagination (best)
SELECT * FROM posts 
WHERE created_at < (SELECT created_at FROM posts WHERE id = $1)
ORDER BY created_at DESC
LIMIT 20;

-- ✅ Keyset pagination (for large tables)
SELECT * FROM posts 
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### 3. Aggregation Optimization

```sql
-- ❌ Recalculate every time
SELECT COUNT(*) FROM posts WHERE user_id = $1;

-- ✅ Cache with denormalization + trigger
ALTER TABLE users ADD COLUMN post_count INT DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET post_count = post_count + 1 WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_insert_count
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION increment_post_count();
```

### 4. Full-Text Search

```sql
-- ✅ GiST index for full-text search
ALTER TABLE posts ADD COLUMN search_vector tsvector;

CREATE INDEX idx_posts_search ON posts USING gist(search_vector);

-- Create trigger to auto-update
CREATE OR REPLACE FUNCTION posts_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.title || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_search_trigger
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION posts_search_update();

-- Query
SELECT * FROM posts 
WHERE search_vector @@ plainto_tsquery('english', 'my search term')
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'my search term')) DESC;
```

---

## Row-Level Security (RLS)

### Basic RLS Setup

```sql
-- Enable RLS on table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ✅ Users can only see their own posts
CREATE POLICY select_own_posts ON posts
  FOR SELECT
  USING (auth.uid() = user_id);

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

### Advanced RLS Patterns

```sql
-- RLS with team/organization
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_access_posts ON posts
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- RLS with admin override
CREATE POLICY admin_all_posts ON posts
  FOR ALL
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS with published status (mix public + private)
CREATE POLICY view_posts ON posts
  FOR SELECT
  USING (
    is_published = true OR
    user_id = auth.uid()
  );
```

### Testing RLS

```sql
-- Test as specific user
SET "request.jwt.claims" = json_build_object('sub', 'user-id-here')::text;

-- View should respect RLS
SELECT * FROM posts;

-- Reset
RESET "request.jwt.claims";
```

---

## Migrations & Versioning

### Migration File Structure

```
supabase/migrations/
├── 001_initial_schema.sql
├── 002_add_posts_table.sql
├── 003_add_rls_policies.sql
├── 004_create_indexes.sql
└── 005_add_search_vector.sql
```

### Safe Migration Pattern

```sql
-- ✅ 001_create_users_table.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- ✅ 002_add_profile_field.sql (backward compatible)
ALTER TABLE users ADD COLUMN profile_data JSONB DEFAULT '{}'::JSONB;

-- ❌ Avoid: Direct column deletion (breaks existing apps)
-- ALTER TABLE users DROP COLUMN email;

-- ✅ Better: Deprecate first, then remove in later migration
ALTER TABLE users RENAME COLUMN email TO email_deprecated;

-- ✅ 003_add_new_email_field.sql
ALTER TABLE users ADD COLUMN email_new TEXT;
UPDATE users SET email_new = email_deprecated WHERE email_deprecated IS NOT NULL;
ALTER TABLE users DROP COLUMN email_deprecated;
ALTER TABLE users RENAME COLUMN email_new TO email;
```

### Supabase Migrations CLI

```bash
# Generate migration
supabase migration new add_posts_table

# Apply migrations
supabase migration up

# Rollback
supabase migration down
```

---

## Supabase-Specific Features

### 1. Real-Time Subscriptions

```sql
-- Tables must have replication enabled
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Only specific columns (optional, for security)
ALTER PUBLICATION supabase_realtime SET (publish = 'INSERT,UPDATE,DELETE') FOR TABLE posts;
```

```javascript
// Client-side subscription
const subscription = supabase
  .from('posts')
  .on('*', payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

### 2. Vector/Embedding Support

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column
ALTER TABLE posts ADD COLUMN embedding vector(1536);

-- Index for similarity search
CREATE INDEX idx_posts_embedding ON posts USING ivfflat (embedding vector_cosine_ops);

-- Query similar posts
SELECT id, title,
  1 - (embedding <=> $1::vector) as similarity
FROM posts
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

### 3. Postgres Functions (as APIs)

```sql
-- Simple function
CREATE OR REPLACE FUNCTION hello_world()
RETURNS TEXT AS $$
  SELECT 'Hello World';
$$ LANGUAGE sql;

-- With parameters
CREATE OR REPLACE FUNCTION get_user_posts(user_id UUID)
RETURNS TABLE (id UUID, title TEXT, created_at TIMESTAMP) AS $$
  SELECT id, title, created_at FROM posts WHERE posts.user_id = user_id;
$$ LANGUAGE sql;

-- Call from client
const { data, error } = await supabase
  .rpc('get_user_posts', { user_id: 'xxx' })
```

---

## Common Performance Pitfalls

| Issue | Problem | Solution |
|-------|---------|----------|
| N+1 queries | App makes 1+N queries | Use JOIN or batch queries |
| No indexes | Slow WHERE/ORDER BY | Index filtered/sorted columns |
| OFFSET pagination | Slow for large offsets | Use cursor-based pagination |
| Missing constraints | Data corruption | Add NOT NULL, UNIQUE, FK |
| DECIMAL as FLOAT | Rounding errors | Use NUMERIC for money |
| Missing RLS | Data leaks | Enable RLS on sensitive tables |
| Text as ENUM | Slow filtering | Use ENUM type |
| JSON over JSONB | Slower queries | Use JSONB for indexing |

---

## Quick Checklist

- [ ] Use UUID or BIGINT for primary keys
- [ ] Always add `created_at` and `updated_at` timestamps
- [ ] Create indexes on frequently filtered columns
- [ ] Use NUMERIC for money, not FLOAT
- [ ] Use ENUM for fixed values (role, status)
- [ ] Use JSONB for semi-structured data
- [ ] Enable RLS on sensitive tables
- [ ] Set up CASCADE deletes for orphaned records
- [ ] Test queries with EXPLAIN ANALYZE
- [ ] Denormalize only when necessary and proven by profiling