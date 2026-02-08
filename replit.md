# replit.md

## Overview

This is a full-stack landing page builder application for showcasing games. It features a public-facing landing page that displays game cards in a responsive grid, and an admin dashboard for managing games and site settings. The app is built with a React frontend and Express backend, using PostgreSQL for data storage.

Key features:
- **Public landing page** with configurable logo, background, button colors, login/register URLs, and a responsive grid of game cards
- **Dynamic buttons system** - admin can add unlimited buttons with individual labels, URLs, colors, sort order, and visibility toggle; displayed vertically on landing page
- **Admin dashboard** ("wieproject") at `/admin` with bright light theme (slate/indigo colors, dark text) for managing games, buttons, and site settings
- **Admin authentication** with hardcoded credentials (username: `admin`, password: `bell2026`)
- **File uploads** via multer for game images, stored locally in `client/public/uploads`
- **Linear gradient outlines** on game cards with two customizable colors (start/end) per game
- **Configurable card background color** via admin settings
- **Snow particle effect** with configurable speed, amount, particle size, custom images (up to 4), and active/inactive toggle
- **Game detail modal** - clicking a card opens a near full-screen popup with large image and all game data
- **Two icon uploads** per game displayed below game name in cards
- **Game duplication** - copy button in admin creates duplicate games

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (`client/`)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router) with three main routes: `/` (home), `/admin/login`, `/admin` (dashboard)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark blue theme), custom fonts (Outfit, Inter)
- **Animations**: Framer Motion for game card animations and page transitions
- **Forms**: React Hook Form with Zod validation via `@hookform/resolvers`
- **Build Tool**: Vite with React plugin, path aliases (`@/` → `client/src/`, `@shared/` → `shared/`)

### Backend (`server/`)
- **Framework**: Express 5 on Node.js with TypeScript (run via `tsx`)
- **API Pattern**: REST API under `/api/*` prefix. Routes defined in `server/routes.ts` with shared route definitions in `shared/routes.ts`
- **File Uploads**: Multer configured for local disk storage in `client/public/uploads`, served statically at `/uploads`
- **Authentication**: Simple session-based auth (no hashing for MVP). Admin user auto-seeded on startup
- **Dev Server**: Vite dev server integrated as middleware with HMR support
- **Production Build**: Client built with Vite, server bundled with esbuild into `dist/`

### Shared Code (`shared/`)
- **Schema**: Drizzle ORM schema definitions in `shared/schema.ts` — three tables: `settings`, `games`, `users`
- **Validation**: Zod schemas auto-generated from Drizzle schemas via `drizzle-zod`
- **Route Contracts**: API route definitions with Zod response schemas in `shared/routes.ts`

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: `node-postgres` (pg) Pool, configured via `DATABASE_URL` environment variable
- **Schema Push**: `npm run db:push` uses `drizzle-kit push` to sync schema to database
- **Tables**:
  - `settings` — singleton row for site configuration (logo URL, background URL, button color/shape, column counts, icon size, site title, card bg color, button dimensions, snow settings with 4 image slots)
  - `games` — game entries with provider, name, deposit/withdraw/bet info, date/time, image URLs, two icons, outline gradient colors, publish status, description
  - `buttons` — dynamic landing page buttons with label, URL, color, outline color, sort order, visibility toggle
  - `users` — admin users with username, password (plaintext for MVP), isAdmin flag

### Storage Layer
- `server/storage.ts` defines an `IStorage` interface with a `DatabaseStorage` implementation
- Provides methods for users (get, create), settings (get, update with upsert), and games (CRUD)

### Key Scripts
- `npm run dev` — Start development server with Vite HMR
- `npm run build` — Build client (Vite) and server (esbuild) to `dist/`
- `npm start` — Run production build
- `npm run db:push` — Push Drizzle schema to PostgreSQL
- `npm run check` — TypeScript type checking

## External Dependencies

### Database
- **PostgreSQL** — Required. Connection string must be provided via `DATABASE_URL` environment variable
- **Drizzle ORM** + **drizzle-kit** — Schema management and query building
- **express-session** + **memorystore** — Session management for admin authentication

### Key NPM Packages
- **express** v5 — HTTP server
- **multer** — File upload handling
- **zod** — Runtime validation
- **drizzle-zod** — Bridge between Drizzle schemas and Zod
- **@tanstack/react-query** — Client-side data fetching/caching
- **framer-motion** — Animations
- **wouter** — Client-side routing
- **react-hook-form** — Form management
- **shadcn/ui ecosystem** — Radix UI primitives, class-variance-authority, clsx, tailwind-merge, lucide-react icons
- **vaul** — Drawer component
- **embla-carousel-react** — Carousel component
- **recharts** — Chart components (available in UI library)
- **react-day-picker** + **date-fns** — Date picker functionality

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal** — Runtime error overlay in development
- **@replit/vite-plugin-cartographer** — Dev tooling (dev only)
- **@replit/vite-plugin-dev-banner** — Dev banner (dev only)

### External Services
- **Google Fonts** — Outfit, Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter fonts loaded via CDN
- No other external API integrations currently configured (though OpenAI, Stripe, and nodemailer packages are referenced in the build allowlist for potential future use)