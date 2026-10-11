# Project rules

## Stack
Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/Base UI,
TanStack Query, react-hook-form + zod, sonner.
Backend: see /backend AGENTS.md.

## Always
1. Read docs/PRODUCT.md before any UI or domain change.
2. For every task: produce a plan first. Do not write code until the plan lists the files you will touch.
3. Small diffs. One feature per task. Never refactor unrelated files.
4. Reuse existing components in src/components/ui before creating new ones.
5. All user-facing text goes through the i18n layer (en + bn). No hard-coded strings.
6. Every list/page needs loading skeleton, empty state, and error state.
7. Mobile-first. Test at 390px and 1440px.
8. Validate forms with zod. Show errors in plain language.
9. After changes run: npm run lint && npm run build. Fix errors before finishing.

## Never
- Never use floats for money. Never delete money records.
- Never run destructive DB commands, migrations on production, or git push --force.
- Never commit secrets or edit .env files.
- Never add a new dependency without stating why in the plan.