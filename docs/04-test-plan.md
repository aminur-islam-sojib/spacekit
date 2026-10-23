# 04 - Test Plan and Test Cases

## 1. Strategy

Squarespace's editor cannot be fully reproduced locally, so testing has four layers. Cheap layers catch most bugs; the real-site layer catches Squarespace changes.

| Layer | What | Tooling | Runs |
|-------|------|---------|------|
| L1 Unit | Pure logic: schema validation, config merge, migrations, target resolver, feature init/update/destroy against jsdom | Vitest + jsdom | every commit |
| L2 Fixture integration | Real browser against **HTML fixtures built from Squarespace's Custom Code Specification markup** (sections, blocks, edit-mode classes, AJAX event simulation) | Playwright (Chromium, Firefox, WebKit) | every commit |
| L3 Worker | Worker endpoints with a mocked KV: auth, validation, conflicts, caching | Vitest + Miniflare/workerd | every commit |
| L4 Canary (real Squarespace) | Public pages of a **throwaway Squarespace test site** with the plugin installed: features visible, no console errors, probes pass | Playwright | nightly + before release |
| Manual | Editor behaviour behind Squarespace login, real devices, accessibility with a screen reader | Checklist below | each release |

Quality gates in CI: lint, `tsc --strict`, tests, coverage (core >= 80%), `size-limit` budgets, `npm audit` (high+), Lighthouse CI on a fixture page.

## 2. Test environments

- **Local fixtures:** `tests/fixtures/*.html`. Include: `fluid-engine-page.html`, `classic-editor-page.html`, `edit-mode.html` (body has `sqs-edit-mode`), `edit-active.html`, `ajax-nav.html` (dispatches `mercury:load`), `no-blocks.html`.
- **Canary site:** a separate Squarespace trial site on a Core+ plan with 3 pages: Home (Fluid Engine, hero + text + button + image blocks, long enough to scroll), a Gallery page, a Blog post. Never use your real site.
- **Devices/browsers (release matrix):** Chrome, Edge, Firefox, Safari macOS, Safari iOS, Chrome Android; viewports 375, 768, 1440.

## 3. Test cases

Priority: **R1** = must pass for Release 1. Type: U unit, F fixture, W worker, C canary, M manual.

### 3.1 Core runtime

| ID | Test | Expected | Type | Req | Rel |
|----|------|----------|------|-----|-----|
| TC-C01 | Script loads with `defer`; page renders without waiting | No render-blocking in Lighthouse; DOMContentLoaded unaffected | F | FR-C1 | R1 |
| TC-C02 | First visit, config fetch OK | Enabled features applied; config cached in localStorage | F | FR-C2 | R1 |
| TC-C03 | Repeat visit | Cached config applied before network returns (no flash) | F | FR-C2 | R1 |
| TC-C04 | Config endpoint down / 500 / timeout | Cached config used; if none, defaults (all disabled); no exceptions | F | NFR-3 | R1 |
| TC-C05 | Config JSON invalid / wrong schema | Ignored; previous valid config kept; error logged once | U | NFR-4 | R1 |
| TC-C06 | `init` called twice on same feature | Exactly one DOM node, one listener, one style tag | U | FR-C4 | R1 |
| TC-C07 | `destroy` after `init` | No `[data-sk]` nodes, listeners removed (verify with spy), style removed | U | FR-C4 | R1 |
| TC-C08 | Feature A throws in `init` | Feature B still initialises; error recorded with feature id | U | FR-C6 | R1 |
| TC-C09 | `mercury:load` fired | Features re-initialise without duplication | F | FR-C5 | R1 |
| TC-C10 | Kill switch: config `disabled:true` | No DOM/CSS changes at all | F | FR-C7 | R1 |
| TC-C11 | Kill switch: `?sitekit=off` | Same as above; works even if config unreachable | F | FR-C7 | R1 |
| TC-C12 | Squarespace safe mode (`/config/safe` / Disable Scripts in Preview) | Script does not run (platform behaviour); editor usable | M | FR-C7 | R1 |
| TC-C13 | `probe()` fails (required element missing) | Feature self-disables; panel shows warning; no console errors | U/F | FR-C8 | R2 |
| TC-C14 | `prefers-reduced-motion: reduce` | No smooth scrolling/animations | F | FR-C9 | R1 |
| TC-C15 | Script loaded twice (accidentally in header and footer) | Second load is a no-op | U | FR-C4 | R1 |
| TC-C16 | Config has unknown feature id | Ignored; no crash | U | NFR-4 | R1 |
| TC-C17 | Schema migration old->new feature version | Old config migrates correctly; unknown fields dropped | U | - | R2 |

### 3.2 Editor panel

| ID | Test | Expected | Type | Req | Rel |
|----|------|----------|------|-----|-----|
| TC-E01 | Visitor page (no `sqs-edit-mode`) | Editor file is **not requested**; no panel in DOM | F | FR-E1/E2 | R1 |
| TC-E02 | Page with `body.sqs-edit-mode` | Editor loads; launcher button appears | F | FR-E1 | R1 |
| TC-E03 | Class added after load (MutationObserver path) | Panel mounts once | F | FR-E1 | R1 |
| TC-E04 | `?sitekit=edit` fallback | Panel mounts | F | FR-E1 | R1 |
| TC-E05 | Open/close via launcher, close button, Esc | State correct; focus returns to launcher | F | FR-E3 | R1 |
| TC-E06 | Drag panel by header; release; reload | Position clamped to viewport; restored | F | FR-E4 | R1 |
| TC-E07 | Drag beyond viewport / window resized smaller | Panel stays reachable | F | FR-E4 | R1 |
| TC-E08 | Search "back" | Only matching features shown; "No features match" otherwise | F | FR-E5 | R1 |
| TC-E09 | Drill into feature and back | Correct view; list status updates | F | FR-E5 | R1 |
| TC-E10 | Each control type changes config | Page updates within 100 ms | F | FR-E6/E7 | R1 |
| TC-E11 | Edit then reload without publishing | Draft restored; "Unsaved changes" shown | F | FR-E8 | R1 |
| TC-E12 | Reset to defaults | Feature returns to defaults; page updates | F | FR-E8 | R1 |
| TC-E13 | Site CSS tries to style `button`, `input`, `*` globally | Panel look unchanged (Shadow DOM) | F | FR-E10 | R1 |
| TC-E14 | Keyboard only: Tab order, labels, Esc, focus ring | Fully operable; axe has zero serious/critical issues | F | NFR-7 | R1 |
| TC-E15 | Panel does not intercept Squarespace editor clicks outside itself | Clicking blocks still selects them in real editor | M | FR-E11 | R1 |
| TC-E16 | Panel z-index vs Squarespace dialogs | Squarespace dialogs not hidden behind or blocked | M | FR-E11 | R1 |
| TC-E17 | Narrow viewport (<= 480 px) | Panel fits with margins | F | - | R2 |

### 3.3 Publish flow and Worker

| ID | Test | Expected | Type | Req | Rel |
|----|------|----------|------|-----|-----|
| TC-W01 | PUT without token | 401; nothing stored | W | FR-B2 | R1 |
| TC-W02 | PUT with wrong token | 401; panel clears stored token and explains | W/F | FR-B2 | R1 |
| TC-W03 | PUT valid config with token | 200; new revision; GET returns it | W | FR-B1/B2 | R1 |
| TC-W04 | PUT invalid schema (bad color, out-of-range number, unknown keys) | 400 with reason; nothing stored | W | FR-B3 | R1 |
| TC-W05 | PUT body > size limit | 413 | W | FR-B3 | R1 |
| TC-W06 | PUT with stale `If-Match` revision | 409; panel offers "reload latest" | W/F | FR-B4 | R2 |
| TC-W07 | GET is cacheable | `Cache-Control` present; second GET served from cache | W | FR-B1 | R1 |
| TC-W08 | CORS: PUT from non-allow-listed origin | Rejected | W | NFR-4 | R1 |
| TC-W09 | Rollback to previous revision | Previous config restored | W | FR-B5 | R2 |
| TC-W10 | Publish while offline | Clear message; draft kept | F | FR-E9 | R1 |
| TC-W11 | Rapid double-click on Publish | One request; button disabled while pending | F | FR-E9 | R1 |

### 3.4 Feature: Back to top

| ID | Test | Expected | Type | Req | Rel |
|----|------|----------|------|-----|-----|
| TC-B01 | Disabled in config | No button in DOM | F | FR-BTT1 | R1 |
| TC-B02 | Enabled, scrollY < showAfter | Button hidden: opacity 0, not focusable, `aria-hidden` | F | FR-BTT2 | R1 |
| TC-B03 | Scroll past showAfter | Button visible and focusable | F | FR-BTT2 | R1 |
| TC-B04 | Click | Scrolls to top (smooth when allowed); after arrival button hides | F | FR-BTT3 | R1 |
| TC-B05 | Side left/right and offsets | Positioned exactly as configured | F | FR-BTT1 | R1 |
| TC-B06 | Size 32 px on touch device | Hit area still >= 44 px (padding/invisible target) | F | FR-BTT4 | R1 |
| TC-B07 | Keyboard: Tab to button, Enter/Space | Activates; focus ring visible | F | FR-BTT4 | R1 |
| TC-B08 | Colors with low contrast | Panel warns when contrast ratio < 3:1 | F | FR-BTT4 | R2 |
| TC-B09 | No layout shift on show/hide | CLS delta 0 | F | FR-BTT5 | R1 |
| TC-B10 | Page with cookie banner / chat widget at same corner | Offset setting avoids overlap; documented | M | FR-BTT5 | R2 |
| TC-B11 | AJAX navigation between pages | Still exactly one button; scroll listener not duplicated | F | FR-C5 | R1 |
| TC-B12 | Live site on iPhone Safari (dynamic toolbar) | Button stays visible above browser chrome | M | - | R1 |
| TC-B13 | Update config while page open (editor preview) | Old element removed, new one created, no leaks | U | FR-C4 | R1 |

### 3.5 Security

| ID | Test | Expected | Type | Rel |
|----|------|----------|------|-----|
| TC-S01 | Config contains `<img onerror>` in any string | Not rendered as HTML; Worker rejects or escapes | U/W | R1 |
| TC-S02 | Config color value `red;} body{display:none` | Rejected by regex validation | U/W | R1 |
| TC-S03 | Token never appears in page source, network requests other than `PUT`, or logs | Verified by grep and network inspection | M | R1 |
| TC-S04 | SRI hash mismatch (tampered file) | Browser refuses script (verified by test fixture) | F | R1 |
| TC-S05 | `npm audit`, lockfile present, no `eval`/`new Function` (lint rule) | Pass | CI | R1 |

### 3.6 Performance and accessibility

| ID | Test | Expected | Type | Rel |
|----|------|----------|------|-----|
| TC-P01 | `size-limit`: core <= 8 KB gz, each feature <= 5 KB gz | Build fails if exceeded | CI | R1 |
| TC-P02 | Lighthouse CI on fixture with/without script | Performance delta <= 2 points; CLS delta 0 | CI | R1 |
| TC-P03 | No long task > 50 ms attributable to SiteKit (Performance trace) | Pass | F | R2 |
| TC-P04 | axe-core on panel and on visitor UI | 0 serious/critical | F | R1 |
| TC-P05 | Screen reader pass (VoiceOver or NVDA) on panel | Labels and state announced | M | R2 |

### 3.7 Resilience to Squarespace changes (L4 canary)

| ID | Test | Expected | Type | Rel |
|----|------|----------|------|-----|
| TC-R01 | Nightly: load each canary page; assert enabled features visible and probes pass | Green; otherwise auto-issue with screenshot | C | R1 |
| TC-R02 | Nightly: no console errors/warnings from SiteKit | Zero | C | R1 |
| TC-R03 | Nightly: assert Squarespace contract: `[data-sqsp-section]` and `[data-sqsp-block]` exist on canary pages; `body.sqs-edit-mode` absent for logged-out visitor | Pass; failure = Squarespace contract change | C | R1 |
| TC-R04 | Simulated drift: fixture with renamed non-spec class | Adapter fallback engages or `probe()` disables feature cleanly | F | R2 |
| TC-R05 | Duplicate a section / convert Classic to Fluid in canary editor | Targets re-resolve or flag as orphaned (no silent mis-targeting) | M | R2 |

## 4. Manual release checklist (run before every release tag)

1. Update the Code Injection tag on the **canary** site to the release candidate (pinned version + SRI).
2. Open the editor: panel appears, all features toggle, publish works, reload shows published state.
3. Click blocks, drag blocks, open Squarespace dialogs: nothing is blocked or mis-layered (TC-E15/E16).
4. Navigate pages (and AJAX if applicable) in editor and live.
5. Test on iPhone Safari and Android Chrome (TC-B12).
6. Run kill switch both ways (TC-C10/C11). Verify `/config/safe` opens the editor without scripts (TC-C12).
7. Check Lighthouse on Home page before/after.
8. If all pass: update the real site's tag. Keep the previous tag handy for rollback.

## 5. Defect handling and exit criteria

- **Severity 1:** breaks the editor or the live site, or exposes the token. Stop release; kill-switch first, fix after.
- **Severity 2:** a feature misbehaves in one browser. Fix before release if R1, otherwise schedule.
- **Severity 3:** cosmetic. Backlog.
- **Release 1 exit:** every "R1" case passes; no open Sev 1/2; budgets green; manual checklist signed.

## 6. Test data and conventions

- Fixtures are built from the **Custom Code Specification** markup so they model the contract, not private internals.
- Each test name starts with its ID (`TC-B04 ...`) so traceability to requirements is greppable.
- Snapshot tests are banned for DOM structure; assert behaviour and attributes explicitly.
- Flaky test policy: quarantine within 24 h, fix within one week.
