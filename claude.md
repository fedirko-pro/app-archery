# UArchery - Archery Management Application

Comprehensive web platform for managing archery competitions, tournaments, and user profiles.

## About the Project

UArchery is a modern web application designed for managing archery competitions in Ukraine. The project consists of a frontend (React) and backend (NestJS) in a separate repository.

**This repository**: Frontend part of the project (app-archery)
**Backend**: Located in a separate repository `archery-app-backend`

## Tech Stack

### Frontend
- **React 18** + **TypeScript** - frontend foundation
- **Vite** - modern build tool and dev server
- **React Router v7** - client-side routing
- **Material-UI (MUI) v7** - UI components and icons
- **Emotion** - CSS-in-JS styling
- **Sass** - CSS preprocessor
- **i18next** - internationalization (multi-language support)
- **date-fns** - date utilities
- **PWA** - Progressive Web App support with Workbox

### Development Tools
- **ESLint** - code linting with plugins:
  - `@typescript-eslint` - TypeScript rules
  - `eslint-plugin-react` - React rules
  - `eslint-plugin-import-x` - import validation
  - `eslint-plugin-unicorn` - additional rules
  - `eslint-plugin-perfectionist` - import sorting
- **Prettier** - code formatting
- **Husky** - git hooks
- **lint-staged** - pre-commit staged file checks
- **TypeScript strict mode** - strict TypeScript mode

### Package Manager
The project uses **pnpm** as the primary package manager.

## Project Structure

```
app-archery/
├── public/                      # Static files
│   ├── logo192.png
│   ├── logo512.png
│   └── robots.txt
│
├── src/
│   ├── components/              # Reusable components
│   │   ├── Header/             # Site header
│   │   ├── Footer/             # Site footer
│   │   ├── Menu/               # Navigation menu
│   │   ├── NavMenu/            # Navigation menu
│   │   ├── UserMenu/           # User menu
│   │   ├── Converter/          # Score converter
│   │   ├── Settings/           # Settings
│   │   ├── AvatarUploader/     # Avatar upload
│   │   ├── BannerUploader/     # Banner upload
│   │   ├── FileAttachments/    # File attachments
│   │   ├── LanguageToggler/    # Language switcher
│   │   ├── dialogs/            # Dialog windows
│   │   ├── shared/             # Shared components
│   │   │   └── profile-form/   # Profile form
│   │   ├── dev/                # Development components
│   │   └── custom-icons.tsx    # Custom icons
│   │
│   ├── pages/                   # Application pages
│   │   ├── admin/              # Admin panel
│   │   │   ├── admin-panel.tsx
│   │   │   ├── admin-actions.tsx
│   │   │   ├── users-list.tsx
│   │   │   ├── user-edit.tsx
│   │   │   ├── user-profile-view.tsx
│   │   │   └── protected-admin-route.tsx
│   │   ├── profile/            # User profile
│   │   │   ├── profile.tsx
│   │   │   ├── profile-card/
│   │   │   ├── profile-edit-form/
│   │   │   └── profile-edit-page.tsx
│   │   ├── tournament/         # Tournaments
│   │   │   ├── tournament-list/
│   │   │   ├── tournament-detail/
│   │   │   ├── tournament-create/
│   │   │   ├── tournament-edit/
│   │   │   ├── tournament-application-form/
│   │   │   ├── user-applications/
│   │   │   ├── admin-applications/
│   │   │   └── public-application/
│   │   ├── competition/        # Competitions
│   │   │   ├── competition.tsx
│   │   │   ├── competitions-list/
│   │   │   ├── user-page/
│   │   │   ├── user-card/
│   │   │   └── patrol-list/
│   │   ├── categories/         # Categories
│   │   │   ├── Categories.tsx
│   │   │   └── admin/
│   │   ├── sign-in/            # Authentication
│   │   │   ├── sign-in.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── sign-up/            # Registration
│   │   ├── reset-password/     # Password reset
│   │   ├── google-callback/    # OAuth callback
│   │   ├── achievements/       # Achievements
│   │   ├── rules/              # Rules
│   │   ├── About.tsx
│   │   ├── ConverterPage.tsx
│   │   ├── Encyclopedia.tsx
│   │   ├── NotFound.tsx
│   │   ├── Trainings.tsx
│   │   └── protected-route.tsx
│   │
│   ├── contexts/                # React Context
│   │   ├── auth-context.tsx    # Authentication context
│   │   └── types.ts
│   │
│   ├── services/                # API services
│   │   ├── api.ts              # Main API client
│   │   └── types.ts
│   │
│   ├── utils/                   # Utilities
│   │   ├── date-utils.ts       # Date utilities
│   │   └── i18n-lang.ts        # Internationalization
│   │
│   ├── config/                  # Configuration
│   │   ├── env.ts              # Environment variables
│   │   └── types.ts
│   │
│   ├── data/                    # Static data
│   │   ├── categories.ts       # Category data
│   │   └── rules.ts            # Rules
│   │
│   ├── sass/                    # Global styles
│   │   ├── main.scss
│   │   └── helpers/
│   │       ├── _mixins.scss
│   │       └── _reset.scss
│   │
│   ├── img/                     # Images and icons
│   │   ├── icons/
│   │   └── UArchery.png
│   │
│   ├── types/                   # Global TypeScript types
│   │   └── pwa.d.ts
│   │
│   ├── i18n.ts                  # i18next configuration
│   ├── App.tsx                  # Main component
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts           # Vite types
│
├── .env                         # Environment variables (not in git)
├── .gitignore
├── eslint.config.js             # ESLint configuration
├── index.html                   # HTML template
├── package.json
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json
├── vite.config.ts               # Vite configuration
└── README.md
```

## Code Standards

### TypeScript
- **Strict mode** enabled (`strict: true`)
- `noUnusedLocals: true` - no unused local variables
- `noUnusedParameters: true` - no unused parameters
- `noFallthroughCasesInSwitch: true` - no fallthrough in switch
- Use `.tsx` for React components
- Use `.ts` for utils, services, contexts

### Code Style (ESLint)

#### Imports
- **Import sorting** via `perfectionist/sort-imports`:
  1. Side effects
  2. Builtin and external packages
  3. Internal, parent, sibling, index
  4. Objects
  5. Unknown
- **Newline between groups** of imports
- **No extensions** for TypeScript files (`.ts`, `.tsx`)
- **Case-sensitive** imports

#### File Naming
Allowed formats (via `unicorn/filename-case`):
- `camelCase` - for utils, services
- `PascalCase` - for React components
- `kebab-case` - for pages, configs

#### React
- **No need** for `import React` (React 17+)
- **No PropTypes** (use TypeScript instead)
- **Auto-detect** React version

### Formatting (Prettier)
- Auto-format on commit via `lint-staged`
- Formatted: `*.{js,jsx,ts,tsx,css,scss,md,json,html}`
- Command: `pnpm run format`

### Git Hooks (Husky)
**Pre-commit**:
1. Prettier formatting of staged files
2. ESLint check and autofix

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_AUTH_URL=http://localhost:3000/auth/google
```

**Important**: All environment variables for Vite must start with `VITE_`

## Commands

### Development
```bash
pnpm run dev          # Start dev server (default port 3001)
```

### Build
```bash
pnpm run build        # Build for production
pnpm run start        # Preview production build
```

### Code Quality
```bash
pnpm run lint         # Run ESLint
pnpm run format       # Format code with Prettier
```

### Git
```bash
pnpm run prepare      # Initialize Husky hooks
```

## Main Application Features

### Authentication
- JWT-based authorization
- Google OAuth 2.0
- Password reset via email
- Set password for OAuth users
- Role-based access (Admin/User)

### Tournaments
- Tournament creation and management
- Tournament application system
- Admin approval workflow
- Public tournament applications
- Multiple applications per user (different categories)
- Deadline management

### User Profiles
- Full user profile
- Profile editing
- Password change
- Avatar and banner upload
- Achievements (in development)

### Admin Panel
- User management
- Tournament oversight
- Application approvals
- System administration

### Other Features
- Score converter
- Encyclopedia
- Rules
- Categories
- Multi-language support (i18n)

## Backend Integration

Backend API endpoints:
- **Authentication**: `/auth/*`
- **Users**: `/users/*`
- **Competitions**: `/competitions/*`
- **Tournaments**: `/tournaments/*`
- **Email**: `/email/*`

API client is located in `src/services/api.ts`

## PWA Features

- Offline functionality
- App installation capability
- Service Worker for caching
- Workbox for cache management

## Best Practices

### Components
- One component = one file
- Use functional components + hooks
- Extract types to separate `types.ts` files next to component
- Use Material-UI components for consistency

### State
- React Context for global state (auth)
- Local state for component-level state
- No Redux (project doesn't require this complexity)

### Styling
- Primarily Material-UI Emotion (@emotion/styled)
- SCSS for global styles
- Modular styles in `.scss` files next to components

### API
- All API calls via `src/services/api.ts`
- Typed API responses
- Centralized error handling

### i18n
- All text via i18next
- Translation files in `public/locales/{lang}/translation.json`
- Use `useTranslation` hook

## Important Notes for AI

1. **Package Manager**: Always use `pnpm`, not `npm` or `yarn`
2. **Imports**: Follow perfectionist sorting rules
3. **TypeScript**: Always type components, props, state
4. **Formatting**: Code auto-formats on commit
5. **Backend**: Located in separate repository, not here
6. **Environment**: Don't forget `VITE_` prefix for env variables
7. **React Router**: Using v7 (latest version)
8. **Material-UI**: Using v7 (latest version)

## Useful Patterns in Project

### Protected Routes
```tsx
// src/pages/protected-route.tsx - for authenticated users
// src/pages/admin/protected-admin-route.tsx - for admins only
```

### Auth Context
```tsx
// src/contexts/auth-context.tsx
// Provides user, login, logout, isAuthenticated
```

### API Service
```tsx
// src/services/api.ts
// Centralized API client with axios
```

## Deployment

Frontend deploys separately from backend.

**Build**:
```bash
pnpm run build
```

Creates `dist/` directory with static files for deployment.

## Support

For issues or questions - create an issue in the repository.

---

**UArchery** - Modern technology for archery 🏹
