# 02 - Product Brief and Requirements (PRD)

Product working name: **SiteKit** (rename freely).
Status: v1 scope, personal use. Owner: you.

## 1. Goal

> Give one Squarespace 7.1 site owner a self-owned design toolkit: turn features on and tune them from a control panel inside the Squarespace editor, with changes visible live and published safely, and with a maintenance process that keeps features working when Squarespace changes.

### Goals (G)

| ID | Goal | Measure |
|----|------|---------|
| G1 | Replace the paid plugin for the features you actually use | Your top 5 features work on your live site |
| G2 | Editing feels like Spark: panel in the editor, live preview, publish | Change a setting and see it update in under 100 ms |
| G3 | Never harm the site | Zero console errors; kill switch works; editor remains usable with the plugin on |
| G4 | Survive Squarespace updates | A Squarespace markup change is detected within 24 h and fixed in one file |
| G5 | Fast | Visitors download the runtime only (editor excluded); see budgets in NFR |
| G6 | Cheap | Runs on free tiers (GitHub, jsDelivr, Cloudflare) |
| G7 | Easy to extend | A new feature = one folder, about 1 day of work |

### Non-goals (v1)

- Multi-tenant SaaS: no customer accounts, billing or licensing.
- Squarespace 7.0 templates or the Personal/Basic plan.
- Mobile editor UI (the editor is desktop-only; features still work on mobile for visitors).
- Matching 100+ features. Target is 5-10 well-built ones.
- A visual "drag anywhere" builder. This is a settings panel, not a page builder.

## 2. Users

| Persona | Needs |
|---------|-------|
| **Owner-editor (you)** | Open the editor, pick a feature, adjust, publish. Never edit code after setup. Trust that an update will not silently break the site. |
| **Visitor** | Fast, accessible pages. Never sees the editor. Features work on desktop and mobile. |
| **Future you / an AI agent** | Clear docs, tests and conventions so changes are safe. |

## 3. Scope: Release 1 (MVP)

1. Core runtime (boot, config, feature registry, lifecycle, kill switch).
2. Editor panel (draggable, searchable, per-feature settings, live preview, publish).
3. Config backend (Cloudflare Worker + static JSON).
4. Feature 1: **Back to top button**.
5. Safety: error isolation, safe mode, version pinning.
6. CI: lint, unit tests, build, size budget, e2e smoke.

Release 2+ in `05-roadmap-and-next-updates.md`.

## 4. Functional requirements

IDs are stable. Reference them in tests and commits.

### Core runtime

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-C1 | Load from one `<script>` tag in Code Injection (header or footer) with `defer`. | Must |
| FR-C2 | Fetch site config; apply enabled features; apply cached last-known config immediately to avoid flash. | Must |
| FR-C3 | Features register through a common interface: `id`, `schema`, `defaults`, `init(cfg)`, `update(cfg)`, `destroy()`, `probe()`. | Must |
| FR-C4 | Features are idempotent: calling `init` twice never duplicates DOM, listeners or styles. | Must |
| FR-C5 | Re-initialise features on `mercury:load` (AJAX navigation) and after DOM changes where needed. | Must |
| FR-C6 | One failing feature must never stop the others (error boundary). | Must |
| FR-C7 | Kill switch: config flag `disabled: true`, URL `?sitekit=off`, and Squarespace `/config/safe` all result in zero effect on the page. | Must |
| FR-C8 | `probe()` checks that the DOM a feature needs exists. On failure the feature disables itself and reports. | Should |
| FR-C9 | Respect `prefers-reduced-motion` in every animated feature. | Must |

### Editor panel

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-E1 | Panel appears only when the Squarespace editor is detected (`body.sqs-edit-mode`) or `?sitekit=edit`. Never for visitors. | Must |
| FR-E2 | Editor code is a **separate file**, downloaded only in the editor. | Must |
| FR-E3 | Floating button opens/closes the panel; Esc closes. | Must |
| FR-E4 | Panel is draggable, clamped to viewport; position and open state persist. | Must |
| FR-E5 | Features list with search, on/off status, drill-in to settings, back navigation. | Must |
| FR-E6 | Controls are generated from each feature's schema (toggle, range, color, select, text, and later: font, target picker). | Must |
| FR-E7 | Live preview: every change updates the page immediately. | Must |
| FR-E8 | Unsaved draft survives a reload. "Reset to defaults" per feature. | Should |
| FR-E9 | Publish writes config to the backend; shows clear success or failure with a fix. | Must |
| FR-E10 | Panel is isolated from site CSS (Shadow DOM) and keyboard accessible (focus order, labels, Esc). | Must |
| FR-E11 | Panel never intercepts Squarespace's own editor interactions (z-index, pointer events, no global key handlers except Esc when open). | Must |

### Config backend

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-B1 | Public read of the config as cacheable JSON. | Must |
| FR-B2 | Authenticated write (bearer token). | Must |
| FR-B3 | Schema validation on write; reject unknown or oversized data. | Must |
| FR-B4 | Optimistic concurrency: write includes the revision it was based on; conflicts return 409. | Should |
| FR-B5 | Keep the last N revisions for rollback. | Should |

### Feature 1: Back to top button

| ID | Requirement |
|----|-------------|
| FR-BTT1 | Button is fixed at a configurable corner (left/right), offset X/Y, size, roundness, colors. |
| FR-BTT2 | Appears after scrolling a configurable distance; hidden otherwise (and not focusable when hidden). |
| FR-BTT3 | Click scrolls to top; smooth unless reduced-motion or disabled. |
| FR-BTT4 | Accessible name "Back to top"; visible focus ring; 44x44 px minimum touch target on mobile. |
| FR-BTT5 | Does not cause layout shift. Does not overlap Squarespace's own cookie banner or chat widgets by default (configurable offset). |
| FR-BTT6 | Not rendered inside the Squarespace editor unless the panel preview is open. |

## 5. Non-functional requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | Performance | Core runtime <= 8 KB gzip. Each feature <= 5 KB gzip. Editor chunk is not loaded by visitors. |
| NFR-2 | Performance | No layout shift (CLS delta 0). Added Lighthouse performance score drop <= 2 points. No long task over 50 ms from our code. |
| NFR-3 | Reliability | Works with last-known config if the backend is down. Never blocks page render. |
| NFR-4 | Security | No `eval`/`new Function`. Config values are schema-validated and only whitelisted values reach CSS/DOM. Admin token never in the public snippet. |
| NFR-5 | Security | Scripts pinned to an exact version with Subresource Integrity (SRI). 2FA on GitHub and Cloudflare accounts. |
| NFR-6 | Compatibility | Last 2 versions of Chrome, Edge, Firefox, Safari (macOS + iOS), Chrome Android. Squarespace 7.1 with Fluid Engine. |
| NFR-7 | Accessibility | WCAG 2.2 AA for the editor panel and for any visitor-facing UI we render. |
| NFR-8 | Maintainability | TypeScript strict. 80%+ unit coverage on core. Every non-spec selector lives in `adapters/squarespace.ts`. |
| NFR-9 | Observability | Errors are logged with feature id + version. Optional sampled error beacon. |
| NFR-10 | Privacy | No cookies, no personal data collected from visitors. |

## 6. Constraints and risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Squarespace changes markup | High (over time) | High | Spec-first selectors, adapter, `probe()`, nightly canary tests, version pinning, kill switch |
| Editor detection class changes | Medium | Medium | Single detector function; `?sitekit=edit` fallback |
| Code breaks the editor | Medium | High | `/config/safe`, no global listeners, reduced footprint in editor, tested checklist |
| Supply-chain compromise (CDN, GitHub, npm) | Low | Very high | SRI + pinned version, 2FA, minimal dependencies, lockfile, `npm audit` in CI |
| Free-tier limits | Low (personal) | Medium | Static cached config, no per-view Worker calls |
| Scope creep | High | Medium | Roadmap gates; each feature needs spec + tests first |
| Time sink / maintenance | Medium | Medium | Keep feature count small; automate canary tests |

## 7. Success criteria for Release 1

- [ ] Back-to-top feature configurable from the panel and published to the live site.
- [ ] Visitors on a phone and a desktop see it; editor panel never visible to them.
- [ ] All tests in `04-test-plan.md` marked "R1" pass in CI.
- [ ] Size budgets pass.
- [ ] Kill switch verified on the live site.
- [ ] `docs/verified-facts.md` filled in from section 10 of the research doc.
- [ ] You can add a second feature following only the docs (dry run).

## 8. Decisions you must make (owner)

1. Repo host: GitHub (recommended; free CI and jsDelivr).
2. Test Squarespace site: create a **separate throwaway site on a trial** to use as the canary, so tests never touch your real site. (Trial lengths and terms change; check Squarespace.)
3. Panel brand and color. Keep it visually distinct from Squarespace's own UI so you always know what is yours.
