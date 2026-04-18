# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build (Vite)
npm run lint         # ESLint on all TS/TSX files
npm run test         # Run Vitest once
npm run test:watch   # Vitest in watch mode
npm run preview      # Preview production build
```

To run a single test file: `npx vitest run src/path/to/file.test.ts`

## Architecture

**Multi-tenant SaaS training platform** — companies onboard employees who complete CRM training modules and quizzes. Three distinct user roles exist with separate auth flows and dashboards.

### Tech Stack

- React 18 + TypeScript + React Router v6
- Supabase (PostgreSQL + Auth, client at `src/integrations/supabase/client.ts`)
- TanStack Query for server state
- React Hook Form + Zod for forms
- shadcn/ui + Radix UI + Tailwind CSS

### Role-Based Access (3 Roles)

| Role | Entry Point | Dashboard |
|---|---|---|
| `academy_admin` | `/super-admin/login` | `/super-admin` |
| `company_admin` | `/admin/login` | `/admin/:companySlug/dashboard` |
| `employee` | `/:companySlug` | `/:companySlug/training/:topicId` |

Role resolution lives in `src/hooks/useAuth.ts` — it checks `auth.users.user_metadata.role` from Supabase and resolves accordingly. Company admins are defined by email lists stored on the `companies` table (`manager_emails` array).

### Data Model (Supabase)

- `companies` — tenants identified by `slug`; holds `manager_emails`, `domain` (for auto-assignment), `logo_url`
- `company_media` — per-company overrides for training step media (`company_slug`, `topic_id`, `step_index`)
- `training_users` — employee records (`email`, `name`, `company_slug`)
- `training_completions` — tracks completed modules and quiz scores per user

### Training Content

Training cards are **hardcoded** in `src/lib/trainingData.ts` — 10 CRM training modules, each with ordered steps containing text and media. Company admins can override media per step via `company_media`. Progress and quiz scores are persisted to `training_completions`.

### Key Conventions

- Path alias `@/` maps to `src/`
- All Supabase CRUD for companies lives in `src/lib/companies.ts`
- Custom hooks under `src/hooks/` — prefer `useTrainingUser`, `useAuth`, `useAdminData` before writing new data-fetching logic
- `strictNullChecks` and `noImplicitAny` are **disabled** — avoid adding them
- ESLint has `no-unused-vars` disabled; unused imports will not cause lint failures
