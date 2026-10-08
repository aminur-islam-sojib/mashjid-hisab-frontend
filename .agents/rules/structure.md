# Project Structure & Quality Rules — mashjid-hisab-frontend

These rules are the single source of truth for how this codebase is organized.
Read this file before starting any task that creates or edits files under
`src/`. When a rule here conflicts with a pattern you see in an existing file,
the existing file is wrong — follow this document, and flag the conflict
instead of copying the old pattern.

## 1. Where things live

- `app/` — ROUTING ONLY. A `page.tsx` may contain route-param/searchParam
  handling and the render of exactly one top-level feature component.
  Nothing else: no `useState`, no `useQuery`/`useMutation`, no table or form
  JSX directly in a file under `app/`. Target: under 30 lines per page.tsx.
- `features/<domain>/` — ALL business logic for one domain (donations,
  chanda, members, families, ...). Shape for any feature with more than one
  concern:
  ```
  features/<domain>/
    <domain>-page.tsx       orchestrator: owns tab state, dialog-open state,
                             composes the pieces below. This is what page.tsx
                             renders — nothing more.
    hooks/
      use-<thing>.ts         one useQuery or useMutation per file
    components/
      <thing>-table.tsx       presentational only — no data fetching inside
      <thing>-toolbar.tsx
    <action>-dialog.tsx        one file per dialog, flat in the feature root
    types.ts                   domain-specific shapes
    validation.ts               domain-specific zod/validation schemas
  ```
  A simple single-table feature (funds, accounts, categories) doesn't need
  the `hooks/`/`components/` subfolders — one `use-<domain>.ts` file and the
  table inline in `<domain>-page.tsx` is fine until it grows past ~150 lines,
  at which point apply the full shape above.
- `components/` — GENERIC, REUSABLE, ZERO BUSINESS LOGIC ONLY. `ui/` (shadcn
  primitives), `layout/` (Sidebar, Header, app chrome), `brand/` (logo). If a
  component imports `useMosque`, calls `apiClient`, or references a specific
  domain concept (a Due, a Pledge, a Campaign), it does not belong here — it
  belongs in `features/<domain>/components/`.
- `lib/` — framework-agnostic utilities only (`api-client.ts`, `money.ts`,
  `roles.ts`, `utils.ts`). No React components, no hooks.
- `providers/` — app-wide React context only (`auth-provider`,
  `mosque-provider`, `query-provider`). Nothing domain-specific.
- `types/` — CROSS-CUTTING contract types shared by many features (`Role`,
  `FundType`, API envelope shapes). A type used by exactly one feature lives
  in that feature's own `types.ts`, never here.

## 2. The fractal rule — how to grow without inventing new structure

When a feature's `components/` folder exceeds ~8 files, group them into
subfolders by sub-concern (e.g. `transactions/components/table/`,
`transactions/components/filters/`). Apply the same principle one level
deeper — never introduce a new top-level organizing idea to cope with size.

## 3. Role-based access control

Never write a literal role array inline (`["MOSQUE_ADMIN", "TREASURER"]`).
Always import a named constant from `lib/roles.ts`, which mirrors the
backend's `mosque.middleware.ts` role-group constants **by identical name**:

```
OVERSIGHT_ROLES, FINANCIAL_OPERATOR_ROLES, ADMIN_ONLY_ROLES,
OPERATIONAL_ROLES, COLLECTION_OPERATOR_ROLES, EXPENSE_OPERATOR_ROLES
```

Before gating any new button or nav item: find which backend route it calls,
find which of these constants gates that route server-side, use that exact
constant. Do not reason about "which role feels right" from scratch — the
backend already decided this.

Some backend authorization is ownership-based, not role-based (e.g. a
Family's head-or-admin check). For these, compare the resource's own
ownership field (e.g. `family.headMembershipId`) against
`activeMembership.id` directly — `canAccess()` alone does not express this.

Role-gating in the frontend is UX, not security. The backend's 403 is the
real boundary; hiding a button is a courtesy, never the enforcement
mechanism. Don't skip a backend check because the frontend already hides
the button.

## 4. Performance conventions

- Any route that doesn't need the authenticated session — currently
  `app/m/[slug]`, the marketing pages, `verify-receipt/[code]` — must be a
  Server Component. Only wrap the genuinely interactive sub-piece (e.g. a
  paginated list's "load more") in its own small `"use client"` component.
- Every route segment under `app/mosques/[mosqueId]/` should have a sibling
  `loading.tsx` (a skeleton matching that page's layout) once it's built or
  refactored. Add `error.tsx` for any route that calls a mutation.
- Auth redirection (unauthenticated → `/login`, `mustChangePassword` →
  `/change-password`) belongs in root `middleware.ts`, checked against the
  session cookie before any page code runs — not as a `useEffect` inside a
  layout component. The `useEffect` pattern currently in
  `TenantShell` should be migrated here, not copied into new layouts.
- Images go through `next/image`, always. Source assets should be sized
  close to their largest actual display size before being committed — don't
  rely on `next/image` alone to fix an oversized source file.
- Reach for `next/dynamic` for any component whose own dependency is heavy
  (a chart library, a rich text editor) the moment one is introduced — don't
  wait until bundle size becomes a visible problem.

## 5. Dead code

Don't leave scaffold/demo content that doesn't correspond to a real backend
endpoint (e.g. a `prayer-times` or `facility-usage` card with no backing
API). If you're not wiring it to real data in the same task, delete it
rather than leaving it half-built — it reads as a real feature to the next
person (or agent) who opens the file.