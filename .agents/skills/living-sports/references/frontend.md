---
title: Frontend Design with React Native & NativeWind v5
version: 1.0
---

# Frontend Design with React Native & NativeWind v5

## Table of Contents
1. [NativeWind v5 Fundamentals](#nativewind-v5-fundamentals)
2. [Global.css Styling System](#globalcss-styling-system)
3. [Component Architecture](#component-architecture)
4. [Responsive Design Patterns](#responsive-design-patterns)
5. [Media Handling (Video/Image Upload)](#media-handling-videimage-upload)
6. [Forms & Input Handling](#forms--input-handling)
7. [State Management](#state-management)
8. [Performance Optimization](#performance-optimization)
9. [Accessibility (a11y) for Mobile](#accessibility-a11y-for-mobile)
10. [Common Component Patterns](#common-component-patterns)

---

## NativeWind v5 Fundamentals

### Core Concepts

**Utility-first approach for React Native**: Apply Tailwind utilities directly to native components

```jsx
// ❌ Traditional StyleSheet
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
});
<View style={styles.container}>Content</View>

// ✅ NativeWind v5 (utility-first)
import { View, Text } from 'react-native';

<View className="p-4 bg-color-background">
  <Text className="text-color-text-primary">Content</Text>
</View>
```

### NativeWind Utility Classes Quick Reference

```jsx
// Spacing (padding, margin)
// p-{size}: padding, m-{size}: margin
// pt/pb/pl/pr: top, bottom, left, right
<View className="p-4 m-2">Padded with margin</View>

// Colors (use CSS variables from global.css)
<View className="bg-color-background">Light background</View>
<View className="dark:bg-color-surface">Dark mode surface</View>
<Text className="text-color-text-primary">Primary text</Text>

// Sizing
<View className="w-32 h-32">Box (128x128)</View>
<View className="w-full h-1/2">Full width, half height</View>

// Flexbox (default for React Native)
<View className="flex justify-center items-center gap-4">
  <View>Item 1</View>
  <View>Item 2</View>
</View>

// Borders & Shadows
<View className="border border-color-border rounded-lg shadow-lg">Card</View>

// Typography
<Text className="text-3xl font-bold text-color-text-primary">Heading</Text>
<Text className="text-sm text-color-text-secondary">Subtext</Text>

// Opacity
<View className="opacity-75">Slightly transparent</View>

// Responsive (mobile-first)
// The framework handles single-screen layouts, but use conditionals for tablet
<View className="p-4 md:p-8">{/* not typical for mobile */}</View>
```

---

## Global.css Styling System

### Architecture Overview

In Living Sports, **all styling configuration happens in `global.css`**. The `tailwind.config.js` is **NOT modified** and remains generic. This approach provides:

- **Single source of truth** for colors and theme variables
- **Easy dark mode** with OKLch color space
- **Consistent design system** across all components
- **Easy theme updates** without touching component code

### Variable Declaration Pattern

Variables are declared in `@theme inline` and defined in `:root` (light) and `@media (prefers-color-scheme: dark)` (dark):

```css
/* global.css */

@theme inline {
  --color-electric: var(--electric);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
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
    /* Living Sports Neon Green - Dark Mode */
    --electric: oklch(48.616% 0.26687 270.727);
    
    /* Neutral Colors - Dark */
    --primary: oklch(60% 0.15 251);
    --secondary: oklch(50% 0.08 251);
    --background: oklch(12% 0.001 0);
    --surface: oklch(18% 0.001 0);
    --text-primary: oklch(95% 0.01 0);
    --text-secondary: oklch(70% 0.01 0);
    --border: oklch(25% 0.002 0);
    
    /* Semantic Colors */
    --success: oklch(65% 0.15 142);
    --warning: oklch(75% 0.15 70);
    --error: oklch(60% 0.15 25);
  }
}
```

### Adding New Variables

When adding custom colors:

1. Define the Tailwind-friendly name in `@theme inline`
2. Add light mode value in `:root`
3. Add dark mode value in `@media (prefers-color-scheme: dark)`
4. Use OKLch color space for perceptually uniform colors

```css
/* Example: Adding a new fitness-specific color */
@theme inline {
  --color-intensity: var(--intensity);
}

:root {
  --intensity: oklch(52% 0.18 20); /* Orange for intensity */
}

@media (prefers-color-scheme: dark) {
  :root {
    --intensity: oklch(60% 0.22 20); /* Brighter in dark mode */
  }
}
```

### Using Variables in Components

```jsx
import { View, Text } from 'react-native';

// ❌ Don't hardcode colors
<View className="bg-black text-white" />

// ✅ Do use variable classes
<View className="bg-color-background">
  <Text className="text-color-text-primary">Content</Text>
</View>

// ✅ Or use dynamic variables directly in style
<View style={{ backgroundColor: `var(--surface)` }}>
  <Text style={{ color: `var(--text-primary)` }}>Content</Text>
</View>
```

---

## Component Architecture

### File Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   └── Navigation.jsx
│   ├── forms/
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   └── FormGroup.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   └── features/
│       ├── UserProfile.jsx
│       ├── PostList.jsx
│       └── PostForm.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useFetch.js
│   └── useForm.js
├── lib/
│   ├── supabase.js
│   └── utils.js
├── pages/
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   └── NotFound.jsx
└── App.jsx
```

### Base Component Pattern

```jsx
// ✅ Reusable Button component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-medium rounded transition-colors focus:outline-none';
  
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400',
  };
  
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Usage
<Button variant="primary" size="lg">Submit</Button>
<Button variant="danger" disabled>Delete</Button>
```

### Card Component Pattern

```jsx
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

// Usage
<Card>
  <CardHeader>
    <h2 className="text-xl font-bold">Title</h2>
  </CardHeader>
  <CardBody>
    <p>Content here</p>
  </CardBody>
</Card>
```

---

## Responsive Design Patterns

### Mobile-First Approach

```jsx
// ✅ Mobile-first (base styles are mobile, then scale up)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>

// Breakdown:
// - Base (mobile): 1 column
// - md (≥768px): 2 columns
// - lg (≥1024px): 3 columns
```

### Common Breakpoints

```jsx
// Tailwind breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// Examples
<div className="w-full md:w-1/2 lg:w-1/3">
  Dynamic width
</div>

<nav className="hidden md:flex">
  Desktop navigation
</nav>

<nav className="md:hidden">
  Mobile navigation
</nav>

<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive heading
</h1>
```

### Responsive Grid Layout

```jsx
const ProductGrid = ({ products }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.map(product => (
      <Card key={product.id}>
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
        <h3 className="mt-2 font-semibold">{product.name}</h3>
        <p className="text-gray-600">${product.price}</p>
      </Card>
    ))}
  </div>
);
```

---

## Forms & Input Handling

### Controlled Input Components

```jsx
// ✅ Reusable Input component
export const Input = ({ 
  label, 
  error, 
  required = false,
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
          }`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Usage
const [email, setEmail] = useState('');
const [error, setError] = useState('');

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  required
/>
```

### Form Submission Pattern

```jsx
export const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // API call
      const result = await loginUser(formData);
      // Handle success
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        error={errors.email}
        required
      />
      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        error={errors.password}
        required
      />
      {errors.submit && <p className="text-red-500 mb-4">{errors.submit}</p>}
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};
```

---

## State Management

### Local State (useState)

```jsx
// ✅ For simple, isolated state
const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4">
      <p className="text-lg">Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  );
};
```

### Context for Global State

```jsx
// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const login = async (email, password) => {
    // Auth logic
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Usage
const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
};
```

### Async Data Fetching Pattern

```jsx
const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();
        if (isMounted) setData(json);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; }; // Cleanup
  }, [url]);

  return { data, loading, error };
};

// Usage
const PostList = () => {
  const { data: posts, loading, error } = useFetch('/api/posts');

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

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

---

## Performance Optimization

### Code Splitting & Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

export const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </Suspense>
);
```

### Memoization

```jsx
// Prevent unnecessary re-renders
const PostCard = memo(({ post, onDelete }) => {
  return (
    <Card>
      <h3>{post.title}</h3>
      <Button onClick={() => onDelete(post.id)}>Delete</Button>
    </Card>
  );
});

// useCallback for stable function references
const PostList = ({ posts }) => {
  const handleDelete = useCallback((id) => {
    deletePost(id);
  }, []);

  return posts.map(post => (
    <PostCard key={post.id} post={post} onDelete={handleDelete} />
  ));
};
```

### Image Optimization

```jsx
// ✅ Lazy load images with native HTML
<img
  src="image.jpg"
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
/>

// ✅ Use next/image for automatic optimization (Next.js)
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
/>

// ✅ Responsive images with srcset
<img
  src="image.jpg"
  srcSet="image-small.jpg 640w, image-medium.jpg 1024w, image-large.jpg 1536w"
  sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1536px"
  alt="Description"
  className="w-full"
/>
```

---

## Accessibility (a11y)

### Semantic HTML

```jsx
// ✅ Use semantic elements
<header className="bg-blue-600 text-white p-4">
  <h1>Site Title</h1>
</header>

<nav className="bg-gray-200 p-4">
  <ul className="flex gap-4">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main className="p-4">
  <section>
    <h2>Section Title</h2>
    <p>Content</p>
  </section>
</main>

<footer className="bg-gray-800 text-white p-4">
  <p>&copy; 2024</p>
</footer>
```

### ARIA Labels & Descriptions

```jsx
// ✅ Accessible button with title
<button
  aria-label="Close menu"
  className="p-2"
  onClick={closeMenu}
>
  ✕
</button>

// ✅ Accessible form with descriptions
<div>
  <label htmlFor="password">Password</label>
  <input
    id="password"
    type="password"
    aria-describedby="pwd-hint"
  />
  <p id="pwd-hint" className="text-sm text-gray-600">
    Must be 8+ characters
  </p>
</div>

// ✅ Accessible modal
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Confirm Action</h2>
  <p>Are you sure?</p>
</div>
```

### Keyboard Navigation

```jsx
// ✅ Ensure focus is visible
<style>{`
  button:focus, a:focus, input:focus {
    outline: 2px solid blue;
    outline-offset: 2px;
  }
`}</style>

// ✅ Use onKeyDown for keyboard events
const handleKeyDown = (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter') submitForm();
};

<input onKeyDown={handleKeyDown} />
```

---

## Common Component Patterns

### Modal/Dialog Component

```jsx
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
```

### Dropdown Menu

```jsx
export const Dropdown = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded shadow-lg">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Toast Notifications

```jsx
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  return { toasts, showToast };
};

// Usage
const MyComponent = () => {
  const { toasts, showToast } = useToast();

  return (
    <>
      <Button onClick={() => showToast('Success!', 'success')}>
        Show Toast
      </Button>
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded text-white ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
};
```

---

## Quick Checklist

- [ ] Use mobile-first responsive design
- [ ] Create reusable component library
- [ ] Implement error boundaries
- [ ] Add loading states for async operations
- [ ] Use Tailwind utility classes consistently
- [ ] Memoize expensive components
- [ ] Lazy load routes and large components
- [ ] Optimize images with lazy loading
- [ ] Test keyboard navigation
- [ ] Add ARIA labels for accessibility
- [ ] Validate forms before submission
- [ ] Handle network errors gracefully