---
title: Integration, Real-Time & Deployment
version: 1.0
---

# Integration, Real-Time & Deployment

## Table of Contents
1. [API Integration Patterns](#api-integration-patterns)
2. [Real-Time Features](#real-time-features)
3. [Environment Configuration](#environment-configuration)
4. [Error Handling & Logging](#error-handling--logging)
5. [Deployment Workflows](#deployment-workflows)
6. [Monitoring & Observability](#monitoring--observability)
7. [CI/CD Pipelines](#cicd-pipelines)

---

## API Integration Patterns

### Supabase REST API

```javascript
// ✅ Basic CRUD operations
// READ
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);

// CREATE
const { data, error } = await supabase
  .from('posts')
  .insert([
    {
      user_id: userId,
      title: 'My Post',
      content: 'Content here',
    }
  ])
  .select();

// UPDATE
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId)
  .select();

// DELETE
const { data, error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

### Advanced Queries

```javascript
// ✅ Complex filtering
const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    created_at,
    users(id, email),
    comments(id, content)
  `)
  .eq('user_id', userId)
  .in('status', ['published', 'scheduled']) // IN clause
  .neq('comments_count', 0) // Not equal
  .gte('created_at', '2024-01-01') // Greater than or equal
  .lt('likes_count', 100) // Less than
  .like('title', '%search%') // Pattern match
  .order('likes_count', { ascending: false })
  .range(0, 9); // Pagination

// ✅ Full-text search
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .textSearch('title', 'my search term');

// ✅ Joins/relationships
const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    users:user_id (id, name, email),
    tags (id, name)
  `);
```

### Batch Operations

```javascript
// ✅ Insert multiple records
const { data, error } = await supabase
  .from('posts')
  .insert([
    { title: 'Post 1', content: 'Content 1' },
    { title: 'Post 2', content: 'Content 2' },
    { title: 'Post 3', content: 'Content 3' },
  ])
  .select();

// ✅ Batch update (upsert)
const { data, error } = await supabase
  .from('posts')
  .upsert([
    { id: 1, title: 'Updated 1' },
    { id: 2, title: 'Updated 2' },
  ])
  .select();
```

### Custom API Routes (Edge Functions)

```javascript
// lib/api.js
export const callEdgeFunction = async (functionName, payload) => {
  const token = await getAuthToken();

  const response = await fetch(
    `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

// Usage
const result = await callEdgeFunction('send-email', {
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Welcome to our app',
});
```

### GraphQL Integration

```javascript
// ✅ Query with GraphQL (if enabled)
const query = `
  query GetPosts($userId: UUID!) {
    posts(where: { user_id: { eq: $userId } }) {
      id
      title
      created_at
      user {
        id
        email
      }
    }
  }
`;

const { data, error } = await supabase.graphql({
  query,
  variables: { userId: 'xxx-xxx' },
});
```

---

## Real-Time Features

### Setup Real-Time Subscriptions

```sql
-- Enable replication on table
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Optional: publish only specific columns for security
ALTER PUBLICATION supabase_realtime SET (publish = 'INSERT,UPDATE,DELETE') FOR TABLE posts;
```

### Subscribe to Changes

```javascript
// ✅ Listen for all changes
const subscription = supabase
  .from('posts')
  .on('*', payload => {
    console.log('Change:', payload);
  })
  .subscribe();

// Listen to specific operations
const subscription = supabase
  .from('posts')
  .on('INSERT', payload => {
    console.log('New post:', payload.new);
  })
  .on('UPDATE', payload => {
    console.log('Updated post:', payload.new);
  })
  .on('DELETE', payload => {
    console.log('Deleted post:', payload.old);
  })
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

### Real-Time in React

```javascript
// ✅ useEffect with real-time subscription
const PostListRealTime = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setPosts(data);
      setLoading(false);
    };

    fetchPosts();

    // Real-time subscription
    const subscription = supabase
      .from('posts')
      .on('INSERT', payload => {
        setPosts(prev => [payload.new, ...prev]);
      })
      .on('UPDATE', payload => {
        setPosts(prev => prev.map(p => 
          p.id === payload.new.id ? payload.new : p
        ));
      })
      .on('DELETE', payload => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    // Cleanup
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <Card key={post.id}>
          <h3 className="font-bold">{post.title}</h3>
          <p className="text-gray-600">{post.content}</p>
        </Card>
      ))}
    </div>
  );
};
```

### Presence (Online Status)

```javascript
// ✅ Track who's online
const usePresence = (channel = 'global') => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const channel = supabase.channel(`presence:${channel}`, {
      config: { broadcast: { self: true } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        setUsers(channel.presenceState());
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user: getCurrentUser(),
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => channel.unsubscribe();
  }, [channel]);

  return users;
};

// Usage
const OnlineUsers = () => {
  const users = usePresence('dashboard');

  return (
    <div className="p-4 bg-green-50 rounded">
      <p className="font-bold">Online: {Object.keys(users).length}</p>
      {Object.values(users).map((user, i) => (
        <p key={i} className="text-sm text-green-700">
          {user[0].user.email}
        </p>
      ))}
    </div>
  );
};
```

---

## Environment Configuration

### Environment Variables Setup

```bash
# .env.local (development)
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=ey...
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development

# .env.production (production)
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=ey...
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

### Configuration Management

```javascript
// lib/config.js
export const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
  },
  api: {
    baseUrl: process.env.REACT_APP_API_URL,
  },
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  isDevelopment: process.env.REACT_APP_ENVIRONMENT === 'development',
  isProduction: process.env.REACT_APP_ENVIRONMENT === 'production',
};

// Usage
import { config } from './lib/config';

if (config.isDevelopment) {
  console.log('Development mode');
}
```

---

## Error Handling & Logging

### Error Handling Pattern

```javascript
// ✅ Comprehensive error handling
const fetchUserPosts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      // Handle specific Supabase errors
      if (error.code === 'PGRST116') {
        throw new Error('Posts not found');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned');
    }

    return { success: true, data };

  } catch (err) {
    // Log error for debugging
    console.error('Error fetching posts:', {
      message: err.message,
      stack: err.stack,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Return error to UI
    return {
      success: false,
      error: err.message,
      code: err.code,
    };
  }
};
```

### Error Boundary (React)

```javascript
// components/ErrorBoundary.jsx
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Log to error tracking service (Sentry, etc)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-900 font-bold">Something went wrong</h2>
          <p className="text-red-700 text-sm mt-2">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Logging Service

```javascript
// lib/logger.js
export const logger = {
  debug: (message, data) => {
    if (config.isDevelopment) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  info: (message, data) => {
    console.log(`[INFO] ${message}`, data);
  },

  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data);
  },

  error: (message, error, context = {}) => {
    console.error(`[ERROR] ${message}`, {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });

    // Send to error tracking (Sentry)
    if (config.isProduction) {
      sendToSentry(message, error, context);
    }
  },
};
```

---

## Deployment Workflows

### Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project
vercel link

# 4. Set environment variables
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY

# 5. Deploy
vercel deploy --prod

# Or push to git and auto-deploy
git push origin main
```

### Deploy to Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Initialize
netlify init

# 4. Set environment variables in netlify.toml
```

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[env.production]
  REACT_APP_SUPABASE_URL = "https://xxx.supabase.co"
  REACT_APP_SUPABASE_ANON_KEY = "ey..."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy with Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

```bash
# Build and push
docker build -t myapp:latest .
docker tag myapp:latest myregistry/myapp:latest
docker push myregistry/myapp:latest

# Run
docker run -p 3000:3000 \
  -e REACT_APP_SUPABASE_URL=xxx \
  -e REACT_APP_SUPABASE_ANON_KEY=xxx \
  myregistry/myapp:latest
```

---

## Monitoring & Observability

### Sentry Integration (Error Tracking)

```javascript
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENVIRONMENT,
  tracesSampleRate: process.env.REACT_APP_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// Wrap App
export const App = Sentry.withProfiler(AppComponent);
```

### Analytics

```javascript
// lib/analytics.js
export const trackEvent = (eventName, properties = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
};

// Usage
const LoginForm = () => {
  const handleLogin = async () => {
    trackEvent('user_login_attempt');
    // ... login logic
    trackEvent('user_login_success', { method: 'email' });
  };
};
```

### Performance Monitoring

```javascript
// ✅ Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);

// ✅ Custom performance marks
performance.mark('api-call-start');
// ... API call ...
performance.mark('api-call-end');
performance.measure('api-call', 'api-call-start', 'api-call-end');
```

---

## CI/CD Pipelines

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Build
        env:
          REACT_APP_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Pre-deployment Checklist

```bash
# Run before deploying
npm run lint      # Check code quality
npm run test      # Run tests
npm run build     # Build for production
npm run analyze   # Analyze bundle size
```

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Tests passing
- [ ] Build succeeds without warnings
- [ ] Error tracking (Sentry) configured
- [ ] Analytics configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Rate limiting configured
- [ ] Monitoring alerts setup
- [ ] Backup strategy in place
- [ ] Domain/SSL certificate configured
- [ ] CDN configured (if needed)
- [ ] Load balancing configured (if needed)
- [ ] Database backups automated
- [ ] Log retention configured  