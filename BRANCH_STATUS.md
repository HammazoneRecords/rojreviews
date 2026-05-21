# BRANCH_STATUS — ROJ Reviews

**App path:** `active_apps/roj-reviews/`
**Brand:** ROJFeedback — AI-Powered Restaurant Feedback Analysis **for Restaurants of Jamaica**
**Palette:** White `#FFFFFF` bg + Black `#0A0A0A` foreground + Red `hsl(0 84.2% 60.2%)` primary
**Fonts:** Alegreya (body serif) + Belleza (headline sans)
**Source zip:** `Websites Code 9/rojreviewsbasic.zip` (2025-08-06, Firebase Studio export — newer than `rojfeedback.zip` 2025-07-28 which is superseded)

**Live domain:** TBD — proposed `roj.mindwaveja.com` or `rojreviews.com` (decision pending)
**VPS container:** Not deployed yet — proposed `mw-roj-reviews`
**VPS port:** 3011 (pre-allocated; ral-reviews has 3010)
**Repo:** Not yet its own git repo. Per CLAUDE.md INS-018, becomes `HammazoneRecords/roj-reviews` before first deploy.

---

## Current State

| Branch | Last Updated | Deployed? | Notes |
|---|---|---|---|
| (local only) | 2026-05-20 | ⬜ | Foundation done — builds-clean pending |

## Last Action

**Date:** 2026-05-20
**Branch:** local working tree (no git repo yet)
**Action:** Phase 1 foundation — same shape as RAL Reviews (sibling app, see `active_apps/ral-reviews/BRANCH_STATUS.md` for the full pattern). Stripped Firebase + Genkit, scaffolded Better Auth + Drizzle + DeepSeek-via-Ark. Brand identity preserved: ROJFeedback name, JA focus, red-on-white palette.

**What's different from ral-reviews:**
- App name: `roj-reviews` (vs `ral-reviews`)
- Port: 3011 (vs 3010)
- Brand title: "ROJFeedback — for Restaurants of Jamaica" (vs generic "RALFeedback")
- Palette: Red/White/Black (vs Tan/Orange/Coral)
- Page logic: slight differences in `src/app/page.tsx` fawud handling (preserved as-is — both versions work)

**What's the same:**
- 5 AI flows ported to `src/lib/ark.ts` DeepSeek client (analyze-sentiment, score-feedback, summarize-feedback, suggest-improvements, get-improvement-suggestions)
- Same Drizzle schema (restaurants, feedback, fawud_logs, email_subscribers, plus Better Auth's 4 tables)
- Same auth pattern (admin-only via Better Auth, public submission)
- Same Dockerfile pattern (pnpm 2-stage, just different port)
- `src/lib/firebase.ts` shim with throwing stubs

**Schema migration:** none yet — no DB exists. First `drizzle-kit push` runs against a fresh `roj_reviews` Postgres DB in Phase 2.

---

## Phase 2 — Drizzle Query Port

Same playbook as ral-reviews — see `active_apps/ral-reviews/BRANCH_STATUS.md` for the per-method mapping. Differences: seed `restaurants` from this app's own `src/lib/mock-data.ts` which contains the Jamaica-specific restaurant list.

---

## Phase 3 — Deploy to VPS

Same pattern as ral-reviews. Pick domain (Jamaica-themed for ROJ — `roj.mindwaveja.com` is natural), add to compose with port 3011, separate Postgres DB `roj_reviews`, Nginx vhost, Certbot.

---

## Sibling app

See `active_apps/ral-reviews/` for the general (multi-market) version of this same product. The two share architecture but maintain distinct brand identities. Bug fixes that apply to both should be ported in both directions explicitly — do not symlink or share code paths.

---

## History

| Date | Branch | Action | Notes |
|---|---|---|---|
| 2025-08-06 | (source zip) | Firebase Studio export, rojreviewsbasic.zip | Original Genkit + Firestore implementation |
| 2026-05-20 | (local) | Phase 1 — Firebase/Genkit out, Better Auth + Drizzle + Ark in | Mirrors ral-reviews foundation |
