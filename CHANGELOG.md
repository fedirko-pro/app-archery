# Changelog

All notable changes to Sokil are documented here.

## [Unreleased] — June–July 2026

### New Features

#### For Archers

- **Home Dashboard** — new home page with this-week arrows, current streak, recent sessions, upcoming tournament discovery, monthly summary, bow setup prompt, and last achievement widget
- **Achievements System (live)** — replaced the demo with a fully data-driven collection: 35+ badges across 6 categories (Getting Started, Consistency, Volume, Exploration, Tournaments, Mastery) with 4 rarity tiers (Common → Legendary). Progress is calculated in real time from training and tournament data
- **Gamification** — milestone tracking for arrows shot, sessions logged, training streaks, distance walked, and cumulative draw weight lifted; motivational prompts on the dashboard (streak-at-risk, monthly review)
- **Profile Progress Snapshot** — public profile shows weekly arrows, streak, total arrows, and latest achievement; new distance-traveled and weight-lifted achievement milestones
- **Public Profiles & Sharing** — shareable archer profile pages with three privacy tiers (Personal / Limited / Public); share individual achievements and progress snapshots via link

#### For Federations & Clubs

- **Tournament Feedback** — organizers can enable post-event feedback collection; participants submit star ratings and optional comments; admins view aggregated results with average rating and full response list
- **Club Public Profiles & Join Requests** — clubs now have public-facing profile pages; visitors can submit a join request (name, email, optional message); club admins manage pending requests and approve or reject them
- **Club & Federation Affiliation System** — club membership with verified/unverified badges, club admin role, federation hierarchy, member management, and email-based invitation flows
- **Rules Library Expansion** — added official rulebooks for WA, NFAA, IBO, FITARCO, RFETA, AGB, FPTA, FSLU, FABP; `sortOrder` column for controlled display order

#### Platform

- **German Language** — full German translation added as the 6th supported language (EN, UK, ES, IT, PT, DE)
- **Onboarding Wizard** — new guided onboarding flow for first-time users: profile setup, default equipment, sync and privacy preferences
- **Tournament Country Filtering** — tournaments list can be filtered by country; localized empty-state messages per country

### Improvements

- **Statistics** — equipment performance comparison (sessions, arrows, avg per session by gear); average score and best session; score by distance chart; ghost empty states guiding users to log their first session
- **Training Sessions** — mood tracking (Bad / Normal / Good / Amazing); session score sets; session templates (18m indoor, 70m outdoor, quick log); score total display
- **Tournament Sharing** — native share API with fallback to WhatsApp, Facebook, X (Twitter), LinkedIn, and email link options; copy-link button
- **Profile** — preferred division field; country field; updated avatar crop/upload UX
- **Dashboard Engagement** — streak-at-risk prompt when the current week has no session logged; monthly summary card at the start of a new month; bow setup nudge for users without equipment
- **Navigation** — role-based menu restructure; Applications link added to user menu; organizer-tools grouping

### Infrastructure

- **pnpm Monorepo** — unified workspace: `apps/web` (Next.js), `apps/api` (NestJS), `packages/shared-types`, `packages/shared-configs`; Turborepo pipeline; shared CI/CD
- **Next.js 15 Migration** — frontend moved from standalone to Next.js 15 App Router (catch-all + React Router SPA)
- **NestJS v11 Upgrade** — API upgraded from v10 to v11
- **GitHub Actions CI** — lint, typecheck, and test pipeline across the monorepo; `shared-types` built before dependents
- **Docker / Deployment** — Traefik-based production compose for Hostinger VPS; MikroORM CLI migration runner fixes; shared `node_modules` layer for pnpm symlinks

### Bug Fixes

- Fixed broken pnpm symlinks in Docker API runner image
- Fixed MikroORM CLI path resolution in production Docker Compose
- Fixed achievement widget styling after NestJS upgrade
- Fixed category code returned instead of ID in application prefill
- Fixed `syncTrainingsAndEquipment` default value in User entity
- Fixed CI build ordering: `shared-types` must build before lint
- Removed Telegram share button (replaced with native share / WhatsApp)
