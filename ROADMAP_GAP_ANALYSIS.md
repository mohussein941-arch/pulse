> SUPERSEDED 2026-06-02 — see pulse-backend/ROADMAP.md (canonical CS Brain Roadmap). Retained for history only.

# Pulse AI Roadmap — Gap Analysis
**Date:** 2026-05-21
**Analyst:** Claude Code
**Source codebase:** `c:\Users\My Lap\pulse` (frontend only; backend is a separate Railway deployment)

---

## ⚠ Sequencing Conflicts — Read Before Implementing

**Two inconsistencies between the roadmap and the existing code affect the build sequence:**

1. **M3 claims "CRM integration (write-back path)" as a reuse target. It doesn't exist.**
   All 15 CRM connector cards in `src/App.jsx:4386–5223` are pure UI simulation. The `/api/sync/run` and `/api/sync/configure` endpoints are called, but the backend has no real CRM API client for any connector. M3's "accepted CRM updates → written via existing CRM integration" is a greenfield build, not reuse. Either M3 scopes CRM write-back out and mocks it, or real CRM write-back must be delivered first. This needs a decision before M3 starts.

2. **`VITE_API_SECRET` is a shared browser-visible secret — the M0 "move secrets to env vars" goal is already partially met for deployment config (Railway env), but the secret is architecturally exposed by design: it's baked into the Vite build and sent as `x-pulse-secret` from every browser session (App.jsx:7136). Any user can read it in DevTools. This is not a configuration problem; it's a design pattern that needs to change (remove the shared secret from all browser-initiated calls, rely purely on JWT for those routes).**

---

## M0 — Foundation Cleanup

### 1. WHAT EXISTS

- `VITE_API_URL` and `VITE_API_SECRET` read from `import.meta.env` in the build (App.jsx:7126–7128). Not hardcoded in source.
- JWT auth flow: login/signup/refresh with proactive token refresh (App.jsx:7163–7307, 10437–10467).
- Session stored in localStorage under `pulse_session_v1` (App.jsx:7152–7161).
- Gmail OAuth connect/disconnect via popup (App.jsx:7357–7382).
- Auth gate: if `API_URL` is set and no session, AuthScreen is shown (App.jsx:10729).

### 2. WHAT'S MISSING

- **`.env` is not in `.gitignore`.** The `.gitignore` (lines 1–24) excludes `*.local` and `node_modules`, but not `.env`. The file is tracked by git.
- **`.env` was committed in commit `536e3dd`** (`Pulse frontend v1`) with the real value `VITE_API_SECRET=pulse-secret-mohamed-2026` and the Railway URL. This secret is now in the git history permanently until scrubbed.
- **No `.env.example` file** in the repo root.
- **`x-pulse-secret` header sent from the browser** in every API call (App.jsx:7136, 5638, 5717, 7325, 7365, 7390, 7410, 7432). The value is baked into the Vite bundle — visible to anyone who opens DevTools → Network tab.
- No test suite proving auth middleware enforces 401 on unauthenticated requests to any backend route.
- No logging for auth failures visible in frontend layer (no error-logging service wired up).
- No security review artifacts: no documented CORS config check, SQL injection audit, or XSS review.
- Git history not scrubbed (`git-filter-repo` or BFG Repo-Cleaner not run).

### 3. NEEDS REFACTOR

- **Remove `x-pulse-secret` from all browser-initiated API calls.** Routes called from the authenticated frontend should rely entirely on `Authorization: Bearer <jwt>`. The shared secret pattern is appropriate only for server-to-server webhook verification (the product-usage webhook). Audit every fetch in App.jsx that sends `x-pulse-secret` and remove it from user-facing routes.
- **Add `.env` to `.gitignore`** and verify `.env.example` is committed with placeholder values instead.
- The email routes (App.jsx:5636–5718, 7323–7443) use both `x-pulse-secret` and optional JWT — if the Gmail OAuth middleware bypass is on the backend email routes, those routes need the JWT check enforced.

### 4. SPEC AMBIGUITIES

- Which secret manager is being adopted — Doppler or Infisical? `VITE_API_SECRET` is a Vite build-time variable, not a runtime env var, so it can't be pulled from Doppler/Infisical at runtime by the browser. The real home for this secret (if kept at all) is Railway's env panel.
- "Auth middleware bypassed during Gmail OAuth integration" — does this mean the `/api/email/gmail/auth` OAuth initiation route is unprotected, the `/api/email/callback` route is unprotected, or all email routes? The backend is not in this repo so can't be confirmed.
- "Logging for auth failures" — is this a backend concern (Railway logs / Supabase logs) or a frontend concern (Sentry / similar)?

### 5. RISKS / DEPENDENCIES

- The `VITE_API_SECRET` value `pulse-secret-mohamed-2026` is in the public git history and has been live in production since the first deploy. Rotating it means: update Railway env → redeploy → no existing browser sessions break (they use JWT, not the secret). Low risk to rotate, but it must be done before any real customer onboards.
- Scrubbing git history rewrites all commit SHAs. Everyone who has cloned the repo must re-clone. If the Vercel deployment is tied to specific SHA references, it may need reconfiguration.

---

## M1 — Context Engine Core

### 1. WHAT EXISTS

- **Health scoring signals** in frontend: NPS (25 pts), CES (25 pts), Product Usage (25 pts), Open Tickets (15 pts), Base (10 pts). Formula in `calcHealth()` at App.jsx:417–432.
- **Health warnings** extracted from signals: `getHealthWarnings()` at App.jsx:437–451 returns top-2 worst signals with labels.
- **Activity log**: per-account event entries stored on backend (source unknown — backend not in repo).
- **Fireflies integration**: API key credential stored, `/api/meetings/sync` endpoint fetches transcripts and matches to accounts. Meeting notes rendered in Activity tab (App.jsx:2622–2680).
- **`/api/ai/briefing-summary` endpoint** exists (App.jsx:9671): sends briefing items array, receives back an AI-generated summary string. This is the only live AI inference endpoint visible in the frontend. Not backed by a Context Engine — it appears to summarize pre-aggregated structured data.
- **Account data model**: each account carries `nps`, `ces`, `productUsage`, `openTickets`, `renewalDate`, `lastContact`, `healthScore`, `churnRisk`, `stakeholders`, `activityLog`, `cesHistory`.

### 2. WHAT'S MISSING

Everything in the M1 spec is new build. None of the following exist in this codebase:

- `interactions` unified table
- `interaction_embeddings` table with pgvector
- `entity_links` table
- `getContext()` retrieval API with 6-stage pipeline
- `reason()` reasoning API with citations
- `ai_traces` table and cost tracking
- `/ai/feedback` endpoint
- `services/context-engine/` directory
- `services/llm/` LLM client abstraction
- Language detection (`franc` or equivalent)
- Sentiment classification (lazy, cached)
- Embedding worker (async pipeline)
- Backfill script for existing account data → interactions
- Supabase migration files (no migrations directory in this repo at all)
- pgvector extension (status unknown — backend not in repo)

### 3. NEEDS REFACTOR

- **Health scoring signals** (`nps`, `ces`, `productUsage`, `openTickets`) are stored as flat fields on the account record. To feed them into `interactions` as `source: crm_event`, either: (a) write a backfill that creates one interaction per historical health-score reading, or (b) start writing new health signal changes as interaction events going forward. The existing `calcHealth()` function stays unchanged — M1 doesn't touch the scoring formula.
- **Fireflies transcripts** are currently stored in a meetings table (inferred from `/api/meetings/sync` response). They need to be normalized and ingested into `interactions` with `source: call_transcript`. The existing Activity tab display can remain unchanged; interactions is the canonical store feeding the Context Engine.
- **Activity log entries** (internal notes, CES logs, milestone completions) should flow into `interactions` as `source: internal_note`. The existing activity log UI is read-only from the frontend — this is a backend migration concern.
- **`/api/ai/briefing-summary`** bypasses the Context Engine because no Context Engine exists yet. Once M1 is live, this endpoint should be rerouted through `getContext()` rather than receiving pre-packaged data.

### 4. SPEC AMBIGUITIES

- **Is pgvector already enabled on the Supabase project?** Cannot confirm from this repo. Must be verified on the Supabase dashboard before writing any embedding code.
- **"Existing CRM data → first source feeding interactions (write a backfill script)"** — but all CRM connectors are UI-only simulations. The "existing CRM data" that actually exists is: manually entered account fields, Fireflies transcripts, activity log entries, and survey responses. The CRM backfill is a no-op until real CRM sync is implemented.
- **Where do Supabase migrations live?** No `migrations/` or `supabase/` directory exists in this repo. The backend repo presumably has them — but this needs confirmation before any schema work starts.
- **Who chooses between OpenAI `text-embedding-3-small` and Voyage AI Arabic?** The spec says "evaluate if Arabic quality underperforms" but gives no benchmark definition. Needs an agreed test before M4 when Arabic data starts flowing.
- **What counts as an "interaction" vs an "internal note"?** For example: a CSM manually typing a meeting note, a playbook step being completed, a renewal date change — which become interactions?

### 5. RISKS / DEPENDENCIES

- **pgvector must be confirmed enabled before any M1 work begins.** Enabling it on an existing Supabase project requires a manual step from the dashboard; it is not a migration.
- **The backend repo is not present locally.** All M1 schema work (migrations) and service code must go into the backend project. This analysis cannot audit what migrations already exist on the backend.
- **Cost discipline from day one** is a stated principle. The `ai_traces` table must be in place before `getContext()` is called in production — otherwise cost data is lost from the first inference.
- **M2 through M7 all depend on M1.** No AI feature should be started without the Context Engine returning stable, ranked, cited results.

---

## M2 — Pre-meeting Brief Generator

### 1. WHAT EXISTS

- **Gmail OAuth (send-only)**: connect/disconnect/set-primary/send working end-to-end (App.jsx:7308–7550).
- **`/api/email/sync`** endpoint: called from EmailSettingsPage to sync emails (App.jsx:7425–7444). Scope of what is synced (inbound vs outbound) unknown without backend access.
- **Fireflies integration**: API key stored, `/api/meetings/sync` fetches transcripts, matched meetings visible in Activity tab with summary text (App.jsx:2622–2680).
- **`/api/ai/briefing-summary`** (App.jsx:9671): AI summary of daily briefing items — closest existing thing to a generated brief, but architecturally different (see §3).
- **Daily Briefing page** (App.jsx:9659–9870): shows ranked alerts, AI narrative, and action items per CSM session. This is a general health digest, not a per-meeting brief.
- **Outreach Queue** (App.jsx:5914–6292): has `aiSummary` state and a note "drafts are currently template-based. Once the AI layer is enabled, each draft will be personalised." Confirms the AI layer is not live.

### 2. WHAT'S MISSING

- Gmail `readonly` scope — current OAuth only authorizes send. Inbound email ingestion requires extending the Gmail OAuth scope and adding a pull/poll mechanism.
- Inbound email parsing and piping to `interactions`.
- Google Calendar OAuth integration (new OAuth service entirely).
- Meeting detection heuristic (check Calendar invitees against known contacts in account stakeholder maps).
- 30-minute pre-meeting trigger.
- `briefs` table.
- Brief generator service (`services/ai-features/pre-meeting-brief/`).
- Brief UI: a dedicated page or modal showing the brief for a specific upcoming meeting with inline citations.
- Per-brief accept/edit/reject feedback captured to `ai_traces`.
- Arabic-language brief generation (language detection on account's primary contact, generate brief in detected language).
- KSA/UAE cultural layer: don't auto-generate for Friday/Saturday meetings.

### 3. NEEDS REFACTOR

- **`/api/ai/briefing-summary`** sends pre-aggregated structured briefing items and gets back a narrative. The M2 brief spec requires: (1) retrieve context via the Context Engine for a specific account/meeting, (2) call `reason()` with task `generate_pre_meeting_brief`, (3) return cited output. These are architecturally different. The existing endpoint should be superseded by a proper Context Engine call, not extended.
- **Email sync** (`/api/email/sync`) needs the OAuth scope extended and the backend updated to pull inbound threads before it can feed `interactions`.

### 4. SPEC AMBIGUITIES

- Is the Brief a new nav page, an inline panel in the account detail view, or a modal triggered from the Daily Briefing? The roadmap says "New page or modal" — needs a UI decision before building.
- What happens when a CSM doesn't use Google Calendar? Is Fireflies the fallback trigger, or does the CSM manually request a brief from the account page?
- Does Arabic brief generation mean the UI renders Arabic text in the CSM's browser (RTL layout implications), or just that the content language is Arabic?
- The spec says "brief generated in Arabic" for Arabic-primary accounts. Does this mean the CSM reading the brief must read Arabic? If the CSM is bilingual, this is fine. If not, the feature may be rejected.

### 5. RISKS / DEPENDENCIES

- Hard dependency on M1 (Context Engine). The brief spec explicitly requires `getContext()` and `reason()` — cannot ship M2 without them.
- Calendar OAuth is entirely new territory. No existing patterns in the codebase for Google Calendar scopes.
- Extending Gmail scope will require existing connected Gmail users to re-authorize, which is a UX event that needs communication.

---

## M3 — Post-meeting Close-out

### 1. WHAT EXISTS

- **Task system**: create/complete/delete tasks API-backed via `/api/tasks` (App.jsx:10512–10539).
- **Renewal pipeline**: stage management visible in UI (App.jsx: pipeline view).
- **Gmail OAuth send**: sending emails works end-to-end.
- **Fireflies sync**: `POST /api/meetings/sync` is a real backend endpoint. The backend runs this on a schedule — transcript data does flow in (evidenced by Activity tab showing matched meetings). The frontend "Sync now" button for Fireflies is wired to the fake `CRMSyncModal`, not the real endpoint (see §3).

### 2. WHAT'S MISSING

- Fireflies webhook/auto-trigger: transcript arrival is not yet detected automatically. Sync is manual button press. A webhook or polling trigger for new Fireflies transcripts is required.
- Close-out generator service (`services/ai-features/post-meeting-closeout/`).
- One-click accept/edit/reject per suggested action (new UI component).
- Accepted tasks → task system: the pathway exists but the wiring from AI suggestion to task creation is new.
- Accepted email → Gmail send: pathway exists but wiring from AI suggestion to send modal is new.
- Accepted CRM updates → CRM write-back: **this does not exist** (see sequencing conflict at top of document).

### 3. NEEDS REFACTOR

- Fireflies sync runs on a backend schedule (not user-triggered from the browser — the frontend "Sync now" button opens a fake `CRMSyncModal` animation, and `handleSyncNow` — the function that would call the real endpoint — is dead code, never called from any UI element, App.jsx:5204). For M3, this needs to become a webhook trigger (new Fireflies transcript arrives → backend triggers close-out generation), not just a scheduled poll.

### 4. SPEC AMBIGUITIES

- "Accepted CRM updates → written via existing CRM integration" — since CRM integrations are UI-only simulation, this deliverable cannot be implemented as stated. Options: (a) scope CRM write-back out of M3 and mock it, (b) implement real HubSpot write-back as part of M3. Decision needed before starting M3.
- Is the close-out UI a dedicated page, a notification, or an overlay that appears after Fireflies sync detects a new meeting?
- "Suggested CRM updates (deal stage, next steps, health signal changes)" — if HubSpot is the only real CRM, are close-out CRM updates HubSpot-specific for now?

### 5. RISKS / DEPENDENCIES

- Hard dependency on M1 (Context Engine) and M2 (Fireflies integration complete).
- Hard dependency on real CRM write-back, which is listed in the roadmap as Phase 5 (after M7 in the existing memory roadmap). This creates a sequencing conflict that must be resolved.
- Fireflies webhook setup requires a publicly accessible webhook URL — must be configured in Railway and registered in the Fireflies dashboard.

---

## M4 — Channel Expansion (Wati + Slack + Tickets)

### 1. WHAT EXISTS

- **WhatsApp survey delivery**: `VITE_WHATSAPP_NUMBER` env var, survey links sent as `wa.me` links (App.jsx:5668). This is outbound link-sharing, not Wati API integration.
- **CRM/ticketing catalog UI cards** for Zendesk, Intercom, Freshdesk, and 11 others (App.jsx:4630–4726) — credentials UI and field mapping UI exist.
- **`POST /api/sync/test`**: real backend call from the credentials modal (App.jsx:4785) — tests that submitted credentials actually authenticate against the target service.
- **`GET /api/sync/status`**: real backend call on page mount (App.jsx:5176) — returns which connectors are connected and their last sync timestamps.
- **`CRMSyncModal`** ("Sync now" for all CRM/ticketing cards): **entirely fake**. `runSync()` uses `setTimeout` to animate a progress bar and generates random created/updated/skipped counts (App.jsx:5020–5024). No backend call is made. After the fake animation the modal calls `onSync()` which is wired to `handleSync()` — a function that is **never defined** in the file, causing a silent JS error (App.jsx:5477). The UI shows "Sync complete" but nothing was synced.
- **`handleSyncNow`** (App.jsx:5204): a real function that calls `/api/sync/run` for CRM connectors and `/api/meetings/sync` for Fireflies, but is **never invoked from any UI element** — dead code.

### 2. WHAT'S MISSING

- Wati API client and integration service.
- Wati periodic sync or webhook ingestion → `interactions` (source: `whatsapp`).
- Contact-to-account phone number matching (no phone field visible on account/contact data model).
- Slack OAuth bot and channel ingestion → `interactions` (source: `slack`).
- Real Zendesk API integration (periodic sync → `interactions` as `source: ticket`).
- Real Intercom API integration (same).
- `ChannelIntegration` interface (`services/integrations/<channel>/` pattern).
- Channel-aware retrieval weighting in Context Engine.
- Arabic sentiment classification (no NLP library referenced anywhere).
- Voice note transcription via Whisper or Gulf-Arabic alternative.
- `services/integrations/wati/`, `services/integrations/slack/`, `services/integrations/zendesk/`, `services/integrations/intercom/` directories.

### 3. NEEDS REFACTOR

- The Integrations page (App.jsx:4386–5223) shows Zendesk and Intercom as connected-credentialed integrations. Replacing the simulated sync with real API calls requires backend work only — the existing credential storage and sync-button UI can be reused.
- The `ChannelIntegration` interface is a new abstraction. Existing Fireflies integration code in the backend is a candidate for refactoring to conform to this interface at the same time.

### 4. SPEC AMBIGUITIES

- **Strategic contradiction**: the roadmap states "Pulse never holds a WABA, never sends WhatsApp messages" but the existing codebase sends WhatsApp survey links (outbound via wa.me). Does the M4 read-only Wati integration replace the existing survey delivery mechanism, or coexist with it? If coexist, what's the model: Pulse reads customer WhatsApp via Wati, but still delivers surveys via wa.me links?
- Does "Wati integration" assume the Pulse customer already has a Wati account with an active WABA? What if they don't?
- Arabic sentiment classification: "evaluate models; fine-tune on Gulf Arabic samples if needed" — who evaluates this, and against what benchmark?

### 5. RISKS / DEPENDENCIES

- All four channel integrations (Wati, Slack, Zendesk real, Intercom real) are greenfield builds with no existing code to build on.
- Gulf Arabic sentiment classification is research work, not pure engineering. Timeline is hard to estimate.
- Contact phone number field must be added to the account/contact data model before Wati contact matching can work.
- M4 depends on M1 Context Engine being live, as all new interactions must feed into it.

---

## M5 — Daily Priority Queue

### 1. WHAT EXISTS

- **Daily Briefing page** (App.jsx:9659–9870): pulls `/api/briefing/today`, renders ranked alert items per account with signal type badges, AI summary at top, action buttons per item. This is the closest existing thing to M5's Priority Queue.
- **`/api/briefing/today`**: returns signal items with fields including `accountId`, `category`, `signalType`, `currentScore`, `status`. Items are ranked by `currentScore` in the frontend (App.jsx:9709).
- **Automation engine**: 12 trigger types, `/api/automation/rules` + `/api/automation/log`. A nightly cron job runs on Railway (from memory). This is the scheduling substrate for the cross-account scoring job.
- **Health scoring + renewal risk**: computed per-account on every render in frontend. Backend presumably computes and stores as well given the briefing API returns scores.
- **Outreach Queue** (App.jsx:5914–6292): AI-drafted outreach items per account with accept/edit/send actions. This is a parallel "action queue" that partially overlaps with M5's intended UX.

### 2. WHAT'S MISSING

- **Cross-account scoring engine**: nightly job computing "needs attention" composite score per account per CSM (separate from per-account health; this aggregates signals into a ranked list).
- Priority queue as a distinct conceptual layer from the current Daily Briefing (the Briefing returns signal items; M5 wants ranked accounts with a single reason + suggested first action).
- Mobile-responsive CSS (current app has no mobile breakpoints).
- Cultural/timezone layer: KSA/UAE Fri/Sat weekend handling, Ramadan calendar awareness, stakeholder timezone for suggested action timing.
- Wati draft-back (push AI-drafted WhatsApp reply to Wati as a pre-filled draft).

### 3. NEEDS REFACTOR

- **Daily Briefing vs Priority Queue overlap**: The existing `BriefingPage` (App.jsx:9659) renders grouped alerts (action items, overdue tasks, wins) — it is already functioning as a priority queue. M5 either replaces this page with a richer version or this becomes the Priority Queue with minor backend changes. A UI decision is needed to avoid building a redundant page.
- The existing `topItems` logic (App.jsx:9715–9724) already deduplicates to one signal per account and limits to 5 — this is the M5 "top 3–7 accounts" concept, already partially implemented in the frontend render logic. The gap is in the backend scoring job, not the UI.

### 4. SPEC AMBIGUITIES

- Is M5's "Today" view a replacement for Daily Briefing, or a new nav item alongside it?
- Does the existing automation engine's nightly cron job become the scheduling substrate for cross-account scoring, or is a separate job created?
- Wati draft-back: how does the CSM receive the draft in Wati? Via API push to a draft queue, or via webhook to the Wati interface? Wati API capabilities need confirming.

### 5. RISKS / DEPENDENCIES

- Cross-account scoring is most valuable when fed by M4 channel data. Shipping M5 before M4 means the scoring engine only sees CRM + Fireflies + email — less signal than intended.
- Mobile CSS is the first mobile work in the entire project. No responsive infrastructure exists. Estimate time accordingly.
- Wati draft-back requires a Wati API that supports draft/template push — confirm API capability before committing to this deliverable.

---

## M6 — Health Narrative + Playbook Recommendations

### 1. WHAT EXISTS

- **`calcHealth()`** (App.jsx:417–432): decomposed scoring with labeled sub-scores and notes per dimension.
- **`getHealthWarnings()`** (App.jsx:437–451): returns top-2 worst signals with label strings (e.g., "NPS 28", "Low usage", "32d no contact"). This is a rule-based narrative seed.
- **Playbook library** (App.jsx:86–481): 12 playbooks across 4 scenarios. Each has a `triggerCondition` JavaScript predicate evaluated against account data (e.g., `a.healthScore < 40`, `a.productUsage > 80`).
- **Playbook auto-trigger**: in the UI, playbooks fire based on `triggerCondition` evaluation — the `ActivePlaybookTab` component (App.jsx:2916) shows matched playbooks.
- **Renewal pipeline risk scoring**: `renewalRisk()` (App.jsx:456–466) returns risk label + color.

### 2. WHAT'S MISSING

- Natural language health narrative generation (currently only numeric score + top-2 warning strings).
- AI-driven playbook recommendation with rationale per recommendation.
- "Why this playbook fits Acme's situation" explanation text.
- One-click "Run this play" creating tasks from playbook steps via AI recommendation (currently: manual playbook activation creates tasks, but there's no AI-recommended path).
- Renewal risk narrative per account in natural language.
- Pylon API integration.
- Salla API integration.

### 3. NEEDS REFACTOR

- **Playbook `triggerCondition` predicates**: these are JavaScript functions defined inline in the playbook library array (App.jsx:94, 114, 132, 151, 170, etc.). The AI recommendation layer must decide whether to: (a) replace these with AI recommendations from the Context Engine, or (b) use them as a pre-filter and augment with AI rationale. Option (b) is lower risk — the rule-based predicates catch obvious cases instantly and cheaply; AI adds rationale and catches non-obvious matches. Option (a) requires regrading the entire playbook logic through the Context Engine on every page load.
- The `getHealthWarnings()` function output (label strings) is the closest existing thing to a health narrative seed. M6's narrative should build on these signals, not replace them.

### 4. SPEC AMBIGUITIES

- Should AI playbook recommendations be additive to rule-based triggers, or replace them? (See §3 above.)
- Pylon and Salla: no existing UI stubs or credential forms for either integration. Are these treated as M4-style channel ingestions or something different?
- "One-click 'Run this play' creates tasks based on playbook steps" — the existing playbook activation already does this manually. The M6 requirement is an AI-recommended entry point to the same flow. Confirm the task creation path is the same, just triggered via AI recommendation.

### 5. RISKS / DEPENDENCIES

- Hard dependency on M1 (Context Engine) — health narrative generation requires cited context retrieval.
- Pylon/Salla are entirely new integrations. Pylon is a CS tooling platform; Salla is a GCC e-commerce platform. Both need API research before estimation.

---

## M7 — Institutional Memory

### 1. WHAT EXISTS

- **Activity log**: per-account event history displayed in the account detail Activity tab (App.jsx:2580–2700). This is the raw accumulated interaction history that M7 reasons over.
- **Stakeholder map**: per-account stakeholder records (names, roles, influence) stored and displayed.
- **HandoverPage** (App.jsx:7671): a public token-gated page for sales-to-CSM handover — a data entry form for the incoming CSM. **This is not the M7 handoff packet generator.** It is a different feature (sales handoff) with a different audience (incoming CSM from sales).
- **Customer portal** (`/portal/:token`): existing public route for customer-facing dashboards.
- All 12 months of interaction data accumulated via M1–M6 will exist in `interactions` and `ai_traces` by the time M7 ships.

### 2. WHAT'S MISSING

- "Catch me up on Acme" natural-language query interface in the Pulse UI.
- AI handoff packet generator for CSM-to-CSM ownership changes (separate from the existing sales HandoverPage).
- Visual stakeholder relationship graph (the data exists per account; the visual graph component doesn't).
- 360dialog API integration (direct BSP, conditional on demand).
- Twilio WhatsApp API integration (same condition).

### 3. NEEDS REFACTOR

- **HandoverPage (App.jsx:7671–7700) vs M7 handoff packet generator**: these must not be conflated. The existing HandoverPage is a sales-to-CSM structured data entry form with a public token. The M7 handoff packet is an AI-generated document for CSM-to-CSM ownership changes, triggered internally. They can coexist; just don't extend the existing HandoverPage to do M7's job.

### 4. SPEC AMBIGUITIES

- "Natural-language command in Pulse UI" for "catch me up" — is this a chat-style input field, a slash command, or a dedicated page? The interaction pattern matters for UX design.
- The visual stakeholder graph — what library? D3, react-flow, Cytoscape? No charting library is currently installed.
- "Sensitive topics to handle carefully" in handoff packets — how are these identified? Does the CSM tag them, or does the AI infer from interaction sentiment?

### 5. RISKS / DEPENDENCIES

- M7 is entirely dependent on M1–M6. The moat is only real if 12+ months of interaction data has been accumulated. M7 shipping early produces an empty context engine with little to reason over.
- "Catch me up" is a general-purpose retrieval feature; it must degrade gracefully for accounts with thin data (e.g., new accounts with < 30 interactions).
- Visual graph requires a new frontend dependency (no charting/graph library installed). This touches `package.json` — the first new production dependency added to the frontend.

---

## Cross-cutting Concerns

### API Routes Inventory
All routes the frontend calls (inferred from App.jsx grep). The backend must enforce auth on all `/api/*` routes:

```
/auth/login /auth/signup /auth/refresh
/api/accounts (GET POST)
/api/accounts/:id (PATCH DELETE)
/api/accounts/bulk (POST)
/api/accounts/churn (GET)
/api/tasks (GET POST)
/api/tasks/:id (PATCH DELETE)
/api/outreach (GET)
/api/outreach/:id (PATCH DELETE)
/api/outreach/:id/send (POST)
/api/briefing/today (GET)
/api/briefing/items/:id (PATCH)
/api/briefing/settings (GET PATCH)
/api/ai/briefing-summary (POST)        ← only live AI endpoint
/api/meetings/manual (POST)
/api/meetings/sync (POST)
/api/sync/test (POST)
/api/sync/configure (POST)
/api/sync/status (GET)
/api/sync/run (POST)
/api/email/accounts (GET)
/api/email/gmail/auth (GET)
/api/email/accounts/:id/set-primary (PATCH)
/api/email/accounts/:id (DELETE)
/api/email/sync (POST)
/api/email/send (POST)
/api/onboarding/plan (POST)
/api/onboarding/tasks (POST)
/api/onboarding/needs (POST)
/api/onboarding/all (GET)
/api/automation/rules (GET)
/api/automation/log (GET)
/api/webhook/token (GET)
/api/webhook/token/regenerate (POST)
/api/audit (GET)
/api/schedules/digests (GET POST)
/api/performance (GET)
/portal/:token    (GET PATCH — public, token-gated)
/handover/:token  (GET POST  — public, token-gated)
/survey/:token    (GET POST  — public, token-gated)
```

The `/portal/`, `/handover/`, and `/survey/` routes are intentionally public (magic-link pattern). All `/api/*` routes must require a valid JWT. The email routes should be audited specifically per the M0 bypass concern.

### Cost Discipline
- Only one live AI inference endpoint exists: `/api/ai/briefing-summary`. It has no cost tracking visible in the frontend.
- `ai_traces` table does not yet exist.
- The Outreach Queue note (App.jsx:6039) says "drafts are currently template-based" — confirms zero AI inference in production outreach.

### Cultural / Arabic Layer
- No language detection library referenced anywhere in the codebase.
- No per-contact language preference field visible in account data model (stakeholders have `name`, `role`, `influence` — no `language` field).
- The Arabic layer is explicitly "built into every feature, not a separate phase" in the roadmap — but no Arabic-related infrastructure exists in M0 state. It becomes a M2+ concern.

### Schema / Migrations
- No `supabase/`, `migrations/`, or `db/` directory in the frontend repo.
- All schema work lives in the backend repo (not available locally). Every M1 schema change must go through Supabase migrations; confirm the backend has a migration runner before starting.

---

## Summary Table

| Milestone | Readiness | Biggest gap | Biggest risk |
|-----------|-----------|-------------|--------------|
| M0 | ~60% | `.env` committed; `x-pulse-secret` browser-visible | Secret in git history; must rotate before any customer |
| M1 | 5% | Entire Context Engine is greenfield | pgvector not confirmed; backend not accessible |
| M2 | 15% | No Calendar integration; Gmail read scope missing | Hard M1 dependency |
| M3 | 15% | No Fireflies webhook; no real CRM write-back | CRM write-back is greenfield, not reuse |
| M4 | 5% | All 4 channel integrations are greenfield | Arabic NLP is research work |
| M5 | 35% | Cross-account scoring job; mobile CSS | Daily Briefing already partially implements this |
| M6 | 20% | AI playbook recommendation; health narrative | Playbook trigger refactor decision needed |
| M7 | 5% | Everything; depends on 12mo of accumulated context | Empty context engine until M1–M6 are live |
