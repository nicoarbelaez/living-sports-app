---
title: Authentication, Security & Authorization
version: 1.0
---

# Authentication, Security & Authorization

## Table of Contents
1. [Supabase Auth Flows](#supabase-auth-flows)
2. [Email/Password Authentication](#emailpassword-authentication)
3. [OAuth Providers](#oauth-providers)
4. [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
5. [JWT & Token Management](#jwt--token-management)
6. [Authorization & Permissions](#authorization--permissions)
7. [Security Best Practices](#security-best-practices)
8. [Session Management](#session-management)

---

## Supabase Auth Flows

### Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client    │◄──────► │  Supabase    │◄──────► │  PostgreSQL  │
│  (React)    │         │   Auth API   │         │    (RLS)     │
└─────────────┘         └──────────────┘         └──────────────┘
     JWT Token    JWT JWT         JWT Token       Enforces
  Stored locally  Verify/Refresh  in headers      Policies
```

### Auth Initialization

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true, // Store session in localStorage
      autoRefreshToken: true, // Auto-refresh expired tokens
      detectSessionInUrl: true, // Detect session from URL
    },
  }
);
```

---

## Email/Password Authentication

### Registration

```javascript
// ✅ Sign up with email/password
const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        display_name: email.split('@')[0],
      },
    },
  });

  if (error) throw new Error(error.message);
  
  // Return confirmation needed message
  return {
    success: true,
    message: 'Check your email to confirm registration',
  };
};

// Usage in component
const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password);
      // Redirect to confirmation page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="max-w-md mx-auto">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </Button>
    </form>
  );
};
```

### Login

```javascript
// ✅ Sign in with email/password
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data.session;
};

// ✅ Check if user is logged in
const checkAuth = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
};

// ✅ Get current user
const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user;
};
```

### Password Reset

```javascript
// ✅ Request password reset
const requestPasswordReset = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw new Error(error.message);
  return { success: true, message: 'Check your email' };
};

// ✅ Confirm password reset with new password
const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw new Error(error.message);
  return { success: true };
};
```

---

## OAuth Providers

### Google OAuth

```javascript
// ✅ Sign in with Google
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw new Error(error.message);
  // Browser redirects to Google login automatically
};

// Usage in component
const GoogleLoginButton = () => (
  <Button onClick={signInWithGoogle} variant="secondary">
    Sign in with Google
  </Button>
);
```

### GitHub OAuth

```javascript
const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw new Error(error.message);
};
```

### Callback Handler

```javascript
// pages/AuthCallback.jsx - Handle OAuth redirect
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        navigate('/login', { state: { error: error.message } });
      } else if (data.session) {
        // Create user profile if first time
        await createUserProfile(data.session.user);
        navigate('/dashboard');
      }
    };

    handleAuthCallback();
  }, []);

  return <div className="p-4">Loading...</div>;
};
```

---

## Multi-Factor Authentication (MFA)

### Setup MFA (TOTP)

```javascript
// ✅ Enroll user in MFA
const enrollMFA = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp', // Time-based one-time password
  });

  if (error) throw new Error(error.message);

  // Show QR code to user for scanning
  return {
    id: data.id,
    totp: {
      qr_code: data.totp.qr_code, // Base64 QR code image
    },
  };
};

// QR Code display component
import QRCode from 'qrcode.react';

const MFASetup = () => {
  const [mfaData, setMfaData] = useState(null);

  useEffect(() => {
    const setup = async () => {
      const data = await enrollMFA();
      setMfaData(data);
    };
    setup();
  }, []);

  return (
    <div className="text-center">
      <p>Scan with your authenticator app:</p>
      {mfaData && <QRCode value={mfaData.totp.qr_code} size={256} />}
    </div>
  );
};
```

### Verify MFA Code

```javascript
// ✅ Verify TOTP code and confirm enrollment
const verifyMFAEnrollment = async (factorId, code) => {
  const { data, error } = await supabase.auth.mfa.verifyFactorChallenge({
    factorId,
    challengeId: code, // This is simplified - see docs for actual flow
    code,
  });

  if (error) throw new Error(error.message);
  return { success: true };
};

// ✅ Login with MFA
const loginWithMFA = async (email, password, totpCode) => {
  // Step 1: Initial login
  const { data: signInData, error: signInError } = 
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError) throw new Error(signInError.message);

  // Step 2: If MFA is enrolled, need to verify
  if (signInData.session?.user?.user_metadata?.mfa_enabled) {
    // Implement MFA verification flow
    // This is complex - refer to Supabase docs
  }

  return signInData.session;
};
```

---

## JWT & Token Management

### Token Structure

```javascript
// JWT Token payload
{
  "sub": "user-id-uuid",
  "aud": "authenticated",
  "role": "authenticated",
  "iat": 1670000000,
  "exp": 1670003600,
  "email": "user@example.com",
  "email_confirmed_at": "2024-01-01T00:00:00Z",
  "iss": "https://xxx.supabase.co/auth/v1",
  "phone_verified": false,
  "app_metadata": { "provider": "email" },
  "user_metadata": { "display_name": "John" }
}
```

### Token Refresh

```javascript
// ✅ Automatic refresh (Supabase handles this)
// When token expires, Supabase automatically refreshes using refresh token

// ✅ Manual refresh if needed
const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) throw new Error(error.message);
  return data.session;
};

// ✅ Get current token
const getAuthToken = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    throw new Error('Not authenticated');
  }

  return data.session.access_token;
};

// Usage in API calls
const fetchWithAuth = async (url, options = {}) => {
  const token = await getAuthToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
```

### Custom Claims in Token

```sql
-- Add custom claims to JWT (PostgreSQL)
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.users 
  WHERE id = event->>'user_id';

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;
```

---

## Authorization & Permissions

### Role-Based Access Control (RBAC)

```sql
-- Create roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Create user_roles junction table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- RLS: Users can only access data they have permission for
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_user_roles ON user_roles
  FOR SELECT
  USING (user_id = auth.uid());
```

### Permission Model

```sql
-- Create permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_UUID(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN user_roles ur ON rp.role_id = ur.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = has_permission.user_id
      AND p.name = has_permission.permission_name
  );
END;
$$ LANGUAGE plpgsql;
```

### API Authorization

```javascript
// ✅ Check permission in React
const ProtectedAction = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkPermission = async () => {
      const { data, error } = await supabase.rpc(
        'has_permission',
        {
          user_id: user.id,
          permission_name: 'edit_posts',
        }
      );

      if (!error) setHasPermission(data);
    };

    checkPermission();
  }, [user]);

  if (!hasPermission) {
    return <p className="text-red-500">Access denied</p>;
  }

  return <Button>Delete Post</Button>;
};
```

---

## Security Best Practices

### Environment Variables

```bash
# .env.local (NEVER commit to git!)
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
# Note: Using ANON_KEY is safe in browser - RLS protects data
```

```javascript
// ✅ Never include secrets in frontend
// The public ANON_KEY is safe because:
// 1. RLS policies enforce database-level security
// 2. Postman/tools can't query without valid JWT
// 3. JWT is issued by Supabase auth only
```

### Input Validation & Sanitization

```javascript
// ✅ Validate on client
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[0-9]/.test(password);
};

// ✅ Server-side validation (SQL)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (email LIKE '%@%.%'),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### SQL Injection Prevention

```javascript
// ❌ WRONG - String interpolation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ RIGHT - Parameterized query (Supabase uses this)
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email); // Parameterized

// ✅ RIGHT - RPC with parameters
const { data, error } = await supabase.rpc('login_user', {
  email: email, // Safe
  password: password,
});
```

### HTTPS & CORS

```javascript
// ✅ Ensure HTTPS in production
// Supabase automatically serves over HTTPS

// ✅ Configure CORS headers
// Supabase automatically handles CORS
// For custom APIs, configure:
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};
```

### Rate Limiting

```javascript
// ✅ Client-side rate limiting (basic protection)
const useRateLimit = (delayMs = 1000) => {
  const [lastCall, setLastCall] = useState(0);

  const execute = async (fn) => {
    const now = Date.now();
    if (now - lastCall < delayMs) {
      throw new Error('Please wait before trying again');
    }
    setLastCall(now);
    return fn();
  };

  return execute;
};

// ✅ Server-side rate limiting (essential)
// Configure in Supabase dashboard or use middleware like express-rate-limit
```

---

## Session Management

### useAuth Hook

```javascript
import { useEffect, useState, useContext, createContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

### Protected Routes

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4">Loading...</div>;
  
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Usage in routing
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Logout

```javascript
// ✅ Sign out
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
  } else {
    // Redirect to login
    navigate('/login');
  }
};
```

---

## Security Checklist

- [ ] Enable HTTPS everywhere
- [ ] Use environment variables for secrets
- [ ] Enable RLS on all sensitive tables
- [ ] Validate input on both client and server
- [ ] Use parameterized queries (not string interpolation)
- [ ] Implement rate limiting
- [ ] Set up MFA for admin accounts
- [ ] Rotate secrets regularly
- [ ] Use CORS to restrict origins
- [ ] Implement session timeouts
- [ ] Log authentication events
- [ ] Keep dependencies updated
- [ ] Use strong password requirements
- [ ] Implement account lockout after failed attempts