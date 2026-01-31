# UArchery - Archery Management Application

A comprehensive web application for managing archery competitions, tournaments, and user profiles. Built with React (frontend) and NestJS (backend).

## 🏹 Features

### Core Features
- **User Authentication & Authorization**
  - JWT-based authentication
  - Google OAuth integration
  - Role-based access control (Admin/User)
  - Password reset functionality
  - Set password for OAuth users

- **Tournament System**
  - Tournament creation and management
  - Application system for tournaments
  - Admin approval workflow
  - Public tournament applications
  - Multiple applications per user (different categories)
  - Application deadline management
  - Tournament status tracking

- **User Profiles**
  - Comprehensive user profiles
  - Profile editing capabilities
  - Password change functionality
  - User achievements (demo page with 7 archery achievements)

- **Admin Panel**
  - User management
  - Tournament oversight
  - Application approvals
  - System administration

- **Utility Tools**
  - Score converter

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Material-UI** - UI component library
- **Sass** - CSS preprocessing
- **PWA** - Progressive Web App support

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **MikroORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Passport** - Authentication strategies
- **Nodemailer** - Email functionality

## 📁 Project Structure

```
├── app-archery/             # Frontend React application (this repo)
│   ├── src/
│   │   ├── components/     # React components (header, nav, footer, etc.)
│   │   ├── pages/          # Page components (tournaments, profile, achievements, etc.)
│   │   ├── contexts/       # React contexts (auth, notifications)
│   │   ├── services/       # API services
│   │   ├── locales/        # i18n translations (en, uk, pt, es, it)
│   │   ├── utils/          # Utility functions
│   │   └── sass/           # Styles
│   ├── public/             # Static assets, PWA manifest
│   └── package.json
│
└── archery-app-backend/    # Backend NestJS application (separate repo)
    ├── src/
    │   ├── auth/           # Authentication module (JWT, Google OAuth)
    │   ├── user/           # User management
    │   ├── tournament/     # Tournament management
    │   ├── email/          # Email functionality
    │   ├── migrations/     # Database migrations
    │   └── ...
    ├── mikro-orm.config.ts # Database configuration
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm, yarn, or pnpm

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd app-archery
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the frontend root:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_GOOGLE_AUTH_URL=http://localhost:3000/auth/google
   VITE_PORT=3001
   ```

4. **Start development server:**
   ```bash
   pnpm run dev
   ```

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd archery-app-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend root:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=archery_user
   DATABASE_PASSWORD=archery_password
   DATABASE_NAME=archery_db
   JWT_SECRET=your_jwt_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Set up the database:**
   ```bash
   # Run database migrations
   npm run mikro-orm migration:up
   ```

5. **Start development server:**
   ```bash
   npm run start:dev
   ```

## 📊 Database Migrations

The project uses MikroORM for database management. Here are the key migration commands:

```bash
# Apply pending migrations
npm run mikro-orm migration:up

# Rollback last migration
npm run mikro-orm migration:down

# Create new migration
npm run mikro-orm migration:create

# Generate migration from entity changes
npm run mikro-orm migration:generate

# List migration status
npm run mikro-orm migration:list
```

## 🧪 Testing

### Frontend Testing
```bash
cd app-archery
npm run test
```

### Backend Testing
```bash
cd archery-app-backend
npm run test
npm run test:e2e
```

## 🏗 Build & Deployment

### Frontend Build
```bash
cd app-archery
npm run build
npm run start  # Preview production build
```
Rule PDFs are served from the **backend** at `/pdf/rules/` (files in `archery-app-backend/pdf/rules/`). The frontend uses `API_BASE_URL/pdf/rules/<filename>`. Keep copies in `public/pdf/rules/` for reference if needed.

### Backend Build
```bash
cd archery-app-backend
npm run build
npm run start:prod
```

## 🔧 Available Scripts

### Frontend (app-archery)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Quality
- **Pre-commit hooks** - Automatic ESLint and Prettier on commit
- **TypeScript strict mode** - Enhanced type safety
- **ESLint configuration** - Code quality enforcement

### Backend (archery-app-backend)
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🌐 API Endpoints

The backend provides RESTful API endpoints for:

- **Authentication**: `/auth/*`
- **Users**: `/users/*`
- **Competitions**: `/competitions/*`
- **Tournaments**: `/tournaments/*`
- **Email**: `/email/*`

## 🔐 Authentication

The application supports multiple authentication methods:
- JWT token-based authentication
- Google OAuth 2.0
- Password reset via email

## 📱 PWA Features

The frontend is configured as a Progressive Web App with:
- Offline functionality
- Install prompts
- App-like experience
- Service worker for caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED license - see the LICENSE file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🔄 Version History

- **v0.1.2** - Achievements demo page, About app page rename, scoring card demo improvements
- **v0.1.1** - PWA support, tournament management, offline capabilities
- **v0.0.1** - Initial release with basic competition management

---

**UArchery** - Empowering archery communities with modern technology 🏹 