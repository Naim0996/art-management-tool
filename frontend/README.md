# 🎨 Frontend Application

Modern e-commerce frontend for the Art Management Tool. Built with Next.js 15, TypeScript, and Tailwind CSS for a fast, responsive, and beautiful user experience.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PrimeReact](https://img.shields.io/badge/PrimeReact-Latest-orange)](https://primereact.org/)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Configuration](#configuration)
- [Internationalization](#internationalization)
- [Deployment](#deployment)

## ✨ Features

### Customer Experience
- 🛍️ **Product Catalog**: Browse art with advanced filtering and search
- 🛒 **Shopping Cart**: Real-time cart with session persistence
- 💳 **Secure Checkout**: Stripe integration with 3D Secure support
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop
- 🌐 **Multi-language**: Support for English, Italian, and more
- 🎨 **Modern UI**: Clean design with PrimeReact components
- ⚡ **Fast Loading**: Next.js 15 with App Router for optimal performance
- 🔍 **SEO Optimized**: Server-side rendering and meta tags

### Admin Dashboard
- 🔐 **Secure Login**: JWT-based authentication
- 📊 **Product Management**: Full CRUD operations
- 📦 **Order Management**: Track and fulfill orders
- 💾 **Inventory Control**: Real-time stock management
- 🔔 **Notifications**: System alerts and updates
- 📈 **Analytics**: Sales metrics and insights (coming soon)
- 👤 **Personaggi**: Artist/character profile management

### Technical Features
- 🚀 **App Router**: Next.js 15 App Router with layouts
- 🎯 **Type Safety**: Full TypeScript coverage
- 🎨 **Styling**: Tailwind CSS with custom configuration
- 🧩 **Component Library**: PrimeReact for UI components
- 🌍 **i18n**: next-intl for internationalization
- 🔄 **State Management**: React Context API
- 📡 **API Integration**: Type-safe service layer
- 🎭 **Loading States**: Skeleton screens and spinners
- ⚠️ **Error Handling**: User-friendly error messages

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with Server Components
- **TypeScript 5**: Full type safety

### Styling & UI
- **Tailwind CSS 3**: Utility-first CSS framework
- **PrimeReact**: Rich UI component library
- **PrimeIcons**: Icon library
- **Custom CSS**: Additional styling for specific components

### Internationalization
- **next-intl**: Type-safe i18n with locale routing
- **Supported Languages**: English (en), Italian (it)

### API & Data
- **Fetch API**: Native HTTP client
- **Service Layer**: Abstracted API calls
- **Type Guards**: Runtime type checking

### Development Tools
- **ESLint**: Code linting
- **TypeScript Compiler**: Type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## 🏗️ Project Structure

```
frontend/
├── app/                          # Next.js 15 App Router
│   ├── [locale]/                # Internationalized routes
│   │   ├── admin/               # Admin dashboard
│   │   │   ├── personaggi/     # Character management
│   │   │   ├── layout.tsx      # Admin layout
│   │   │   └── page.tsx        # Admin dashboard
│   │   ├── cart/               # Shopping cart page
│   │   ├── checkout/           # Checkout flow
│   │   ├── shop/               # Shop pages
│   │   │   ├── [slug]/        # Product detail page
│   │   │   └── page.tsx       # Product listing
│   │   ├── layout.tsx          # Locale-specific layout
│   │   └── page.tsx            # Home page
│   ├── favicon.ico             # Site favicon
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Root page (redirects)
│
├── components/                  # React components
│   ├── AdminLayout.tsx         # Admin panel layout wrapper
│   ├── AdminSidebar.tsx        # Admin navigation sidebar
│   ├── headerComponent.tsx     # Site header
│   ├── footerComponent.tsx     # Site footer
│   ├── ProductCard.tsx         # Product display card
│   ├── CartItem.tsx            # Cart item component
│   ├── CheckoutForm.tsx        # Checkout form
│   └── ...                     # Other components
│
├── services/                    # API service layer
│   ├── api.ts                  # Base API client
│   ├── products.ts             # Product API calls
│   ├── cart.ts                 # Cart API calls
│   ├── orders.ts               # Order API calls
│   └── auth.ts                 # Authentication
│
├── messages/                    # i18n translations
│   ├── en.json                 # English translations
│   ├── it.json                 # Italian translations
│   └── ...                     # Other languages
│
├── public/                      # Static assets
│   ├── images/                 # Images
│   ├── fonts/                  # Custom fonts
│   └── ...                     # Other static files
│
├── scripts/                     # Utility scripts
│
├── src/                        # Additional source files
│
├── .eslintrc.json              # ESLint configuration
├── eslint.config.mjs           # ESLint config (new format)
├── middleware.ts               # Next.js middleware (i18n)
├── next.config.ts              # Next.js configuration
├── next-env.d.ts               # Next.js TypeScript definitions
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0 or higher
- **npm**, **yarn**, **pnpm**, or **bun**: Package manager of choice
- **Backend API**: Running on http://localhost:8080 (or configured URL)

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Start with Docker

```bash
# From project root
docker compose up -d frontend

# View logs
docker compose logs -f frontend
```

### First Steps

1. **Browse Products**: Go to `/shop` to see the product catalog
2. **Admin Panel**: Access `/admin` (credentials: admin/admin)
3. **Add to Cart**: Select products and add them to your cart
4. **Checkout**: Complete a test purchase

## 🛠️ Development

### Development Server

```bash
# Start development server
npm run dev

# Start on different port
npm run dev -- -p 3001

# Start with Turbopack (faster)
npm run dev -- --turbo
```

### File Editing

You can start editing pages by modifying files in the `app` directory:
- `app/[locale]/page.tsx` - Home page
- `app/[locale]/shop/page.tsx` - Shop page
- `app/[locale]/admin/page.tsx` - Admin dashboard

The page auto-updates as you edit files thanks to **Fast Refresh**.

### Adding New Pages

```typescript
// app/[locale]/new-page/page.tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

### Creating Components

```typescript
// components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  description?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  description 
}) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
};
```

### API Service Integration

```typescript
// services/myService.ts
import { apiClient } from './api';

export const myService = {
  async getData() {
    const response = await apiClient.get('/my-endpoint');
    return response.json();
  },
  
  async postData(data: any) {
    const response = await apiClient.post('/my-endpoint', data);
    return response.json();
  }
};
```

### Styling with Tailwind

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h3 className="text-lg font-semibold text-gray-800">Title</h3>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click me
  </button>
</div>
```

### Using PrimeReact Components

```tsx
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function MyPage() {
  return (
    <div>
      <InputText placeholder="Search..." />
      <Button label="Submit" icon="pi pi-check" />
      <DataTable value={data}>
        <Column field="name" header="Name" />
        <Column field="price" header="Price" />
      </DataTable>
    </div>
  );
}
```

### Type Checking

```bash
# Run TypeScript compiler check
npm run type-check

# Or use tsc directly
npx tsc --noEmit
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Or use ESLint directly
npx eslint . --ext .ts,.tsx
```

### Testing

```bash
# Run tests (if configured)
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 🏗️ Building for Production

### Build Process

```bash
# Create production build
npm run build

# Build output will be in .next/ directory
```

### Start Production Server

```bash
# After building
npm start

# Server will start on http://localhost:3000
```

### Build Optimization

The build process:
- ✅ Minifies JavaScript and CSS
- ✅ Optimizes images
- ✅ Generates static pages where possible
- ✅ Creates optimized bundles
- ✅ Removes development code
- ✅ Compresses assets

### Build Analysis

```bash
# Analyze bundle size
npm run build -- --profile

# Using bundle analyzer (if configured)
ANALYZE=true npm run build
```

### Static Export (Optional)

```bash
# Generate static HTML export
npm run build
npm run export

# Output will be in out/ directory
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local` for local development:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=30000

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App Configuration
NEXT_PUBLIC_APP_NAME=Art Management Tool
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CART_PERSISTENCE=true

# Default Locale
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

For production, use `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Next.js Configuration

Edit `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Image domains for next/image
  images: {
    domains: ['localhost', 'yourdomain.com'],
  },
  
  // Internationalization
  i18n: {
    locales: ['en', 'it'],
    defaultLocale: 'en',
  },
  
  // Experimental features
  experimental: {
    // Enable if needed
  },
  
  // Custom webpack config
  webpack: (config) => {
    // Customizations
    return config;
  },
};

export default nextConfig;
```

### Tailwind Configuration

Edit `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      },
    },
  },
  plugins: [],
};

export default config;
```

### TypeScript Configuration

`tsconfig.json` is pre-configured with strict settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 🌍 Internationalization

The app uses `next-intl` for internationalization.

### Adding Translations

1. **Edit translation files**:
   ```json
   // messages/en.json
   {
     "common": {
       "welcome": "Welcome",
       "products": "Products",
       "cart": "Cart"
     },
     "shop": {
       "addToCart": "Add to Cart",
       "viewDetails": "View Details"
     }
   }
   ```

   ```json
   // messages/it.json
   {
     "common": {
       "welcome": "Benvenuto",
       "products": "Prodotti",
       "cart": "Carrello"
     },
     "shop": {
       "addToCart": "Aggiungi al Carrello",
       "viewDetails": "Vedi Dettagli"
     }
   }
   ```

2. **Use in components**:
   ```tsx
   import { useTranslations } from 'next-intl';
   
   export default function MyComponent() {
     const t = useTranslations('shop');
     
     return (
       <button>{t('addToCart')}</button>
     );
   }
   ```

### Adding New Locales

1. Create translation file: `messages/es.json`
2. Update middleware: Add locale to list
3. Update i18n routing configuration

### Locale Routing

- Default locale: `/` → English
- Italian: `/it/` → Italian
- Shop in Italian: `/it/shop`
- Admin in English: `/admin`

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy your Next.js app:

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure environment variables
   - Deploy!

3. **Environment Variables**:
   Add the same variables from `.env.production` in Vercel dashboard

### Docker Deployment

```bash
# Build image
docker build -t art-frontend:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production art-frontend:latest
```

### Other Platforms

- **Netlify**: Supports Next.js with automatic detection
- **AWS Amplify**: Full Next.js support
- **Google Cloud Run**: Container-based deployment
- **Azure Static Web Apps**: Next.js compatible
- **DigitalOcean App Platform**: One-click deployment

### Static Hosting (Limited Features)

For static export (loses some Next.js features):

```bash
# Build static export
npm run build
npm run export

# Deploy out/ directory to:
# - GitHub Pages
# - AWS S3 + CloudFront
# - Netlify
# - Any static host
```

### Production Checklist

- [ ] Set production environment variables
- [ ] Configure production API URL
- [ ] Set up Stripe production keys
- [ ] Configure custom domain
- [ ] Enable SSL/HTTPS
- [ ] Set up CDN for assets
- [ ] Configure analytics
- [ ] Set up error tracking
- [ ] Test all features in production mode
- [ ] Optimize images
- [ ] Set up monitoring
- [ ] Configure caching headers

## 📚 Learn More

### Next.js Resources

- 📖 [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- 🎓 [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- 💬 [Next.js Discord](https://discord.gg/nextjs) - Join the community
- 🐙 [Next.js GitHub](https://github.com/vercel/next.js) - Contribute and report issues

### Related Documentation

- 🎨 [Tailwind CSS Docs](https://tailwindcss.com/docs)
- 🧩 [PrimeReact Docs](https://primereact.org/documentation)
- 🌍 [next-intl Docs](https://next-intl-docs.vercel.app/)
- 📘 [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Project Documentation

- 📋 [API Documentation](../SHOP_API.md)
- 🏗️ [Architecture](../ARCHITECTURE.md)
- 🚀 [Deployment Guide](../DEPLOYMENT.md)

## 🤝 Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
