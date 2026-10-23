# 05 - Roadmap and Options for Next Updates

Effort scale (for one developer with an AI agent, part time): **S** about 1-2 days, **M** about 3-7 days, **L** 2+ weeks. These are planning guesses, not commitments.

Risk = how likely Squarespace changes can break it. **Low** means it only uses elements we create or official spec attributes.

## 1. Release plan

| Release | Theme | Outcome |
|---------|-------|---------|
| **M0 Foundations** | Repo, TypeScript, build, CI, split core/editor/feature, verified-facts | Starter file becomes a real project |
| **R1 MVP** | Core + panel + backend + Back to top | You can configure and publish one feature safely |
| **R2 Styling pack** | CSS-only features + target picker | Style text/buttons/blocks without code |
| **R3 Motion** | Scroll/hover/text effects | Motion features, loaded lazily |
| **R4 Navigation** | Mobile menu, dropdown, mega menu | Highest-risk area, built after the resilience layer is proven |
| **R5 Content** | Carousels, logo scroller, before/after, galleries | Heavier components |
| **R6 Marketing** | Popups, cookie banner, chat links, announcement bar | Business features |
| **R7 Productize (optional)** | Multi-site, license, dashboard, billing | Only if you decide to sell |

Rule: **no new feature starts until the previous release's tests are green and the canary has been green for 7 days.**

## 2. Milestone detail

### M0 Foundations (do this first)

1. Create the repo, TypeScript strict, ESLint, Prettier, Vitest, Playwright, esbuild, `size-limit`.
2. Move the starter `sitekit.js` into `src/`: `core/`, `editor/`, `features/backToTop/`, `adapters/squarespace.ts`.
3. Define shared types: `Feature<C>`, `Field`, `SqspEnv`, config schema + validator.
4. CI workflow: lint, typecheck, unit, build, size budget.
5. Fill `docs/verified-facts.md` from the research doc's open questions (on your site).
6. Create the **canary Squarespace site** and a throwaway Cloudflare Worker.

Done when: CI is green on an empty-feature build and the canary site loads the core with no errors.

### R1 MVP

1. Config client: cache-first, validated, kill switch.
2. Worker: auth, schema validation, revision, cache. Deploy.
3. Editor: Preact panel in Shadow DOM, schema-driven controls, draft, publish, error states.
4. Feature: Back to top, full test set TC-B*.
5. Fixtures + L2 tests; canary nightly workflow.
6. Release `1.0.0` with SRI; install on canary, then on your real site.

Done when: PRD section 7 checklist is complete.

### R2 Styling pack + target picker

1. **Target picker:** "Pick a block" mode: highlight blocks on hover, click to select, store multi-signal target (architecture 2.6).
2. **Orphan handling UI:** show orphaned targets with re-pick.
3. Features: Text options, Button styles, Block styling (shadow, border, radius, opacity, margin). All CSS-variable driven.
4. Per-device values (desktop/mobile) in the schema.

### R3 Motion

1. Shared motion service (IntersectionObserver, reduced-motion handling).
2. Features: Scroll reveal, Hover effects, Word loop, Marquee text.
3. Lazy-load GSAP/Lenis only when a motion feature is enabled (check licenses first).

### R4 Navigation

1. Features: Mobile menu styling, Dropdown design, Mega menu.
2. Requires a deep adapter for Squarespace header/nav markup. Highest drift risk, so add dedicated canary assertions first.

### R5 Content

Logo carousel, List and carousel styles, Before/after slider, Accordion styles (uses the official accordion spec attributes).

### R6 Marketing

Popups, cookie notice, announcement bar, WhatsApp/Messenger chat link, scroll indicator.
Note: checkout pages do not support code, so none of these run there (Squarespace limitation).

### R7 Productize (only if selling)

Auth/accounts, per-site IDs, license check, dashboard, Stripe, onboarding, support, legal. This is a different project; treat it as a new PRD.

## 3. Feature catalog (pick your next update from here)

| Feature | Type | Uses | Effort | Drift risk | Value | Notes |
|---------|------|------|--------|-----------|-------|-------|
| Back to top | Own element | Fixed DOM node | S | Low | Medium | R1 |
| Scroll progress bar | Own element | Fixed DOM node | S | Low | Medium | Great second feature, same pattern |
| Announcement bar | Own element | Fixed/inline node | S | Low | Medium | |
| Cookie notice | Own element | Own node + localStorage | M | Low | Medium | Legal wording is your responsibility |
| Custom cursor | Own element | Pointer events | M | Low | Medium | Disable on touch |
| Loading screen | Own element | Early CSS + node | M | Medium | Medium | Needs early paint control |
| Text options (size, color, weight) | Style | `[data-sqsp-text-block-content]` | S-M | Low | High | Spec attribute |
| Button styles | Style | `[data-sqsp-button]` | S-M | Low | High | Spec attribute |
| Image hover/zoom | Style | `[data-sqsp-image-block-image]` | S | Low | High | Spec attribute |
| Block styling (shadow, border, radius) | Style | `[data-sqsp-block]` + target picker | M | Low-Med | High | Needs R2 targets |
| Shape block effects | Style | `[data-sqsp-shape-block-shape]` | S | Low | Low | Spec attribute |
| Accordion styles | Style | Accordion spec attributes | S-M | Low | Medium | Spec attributes |
| Hover effects (reveal, tilt) | Style + JS | Blocks + target picker | M | Medium | High | |
| Scroll reveal animations | JS | IntersectionObserver + blocks | M | Medium | High | Respect reduced motion |
| Momentum/smooth scroll | JS | Lenis-type library | M | Medium | Medium | Can conflict with anchors and editor |
| Word loop headline | JS | Text block + target | M | Medium | Medium | |
| Marquee / scrolling text | JS/CSS | Own markup or text block | M | Low-Med | Medium | |
| Before/after slider | Own component | Image blocks | M | Medium | Medium | |
| Logo carousel | Own component | Image blocks/gallery | M | Medium | High | |
| List and carousel styles | Style | Summary block markup | L | High | High | Summary block internals not fully in spec |
| Mobile menu styling | Style | Header/nav internals | L | High | High | Needs adapter |
| Dropdown menu design | Style | Header/nav internals | L | High | Medium | |
| Mega menu | Own component | Nav internals | L | High | High | Hardest |
| Popups | Own component | Triggers, focus trap, a11y | L | Low-Med | High | Accessibility-heavy |
| Live chat links (WhatsApp, Messenger) | Own element | Link out | S | Low | Medium | |
| Back button / share buttons | Own element | Own node | S | Low | Low | |

## 4. How to choose the next update

Score each candidate 1-5 on: **value to you**, **fits existing patterns**, **low drift risk**, **small effort**. Pick the highest total. A sensible default order after R1:

1. Scroll progress bar (S, proves the pattern a second time)
2. Text options + Button styles (high value, spec attributes, validates the target-free styling path)
3. Image hover effects
4. Target picker + Block styling (unlocks many later features)
5. Scroll reveal + Hover effects
6. Logo carousel
7. Mobile menu / dropdown / mega menu (only after canary history proves stability)

## 5. Process for adding any feature (definition of done)

1. Write a one-page feature spec: goal, settings schema, DOM it needs, probe, accessibility, reduced motion, risks. Add requirement IDs.
2. Write the test cases first (add to `04-test-plan.md`).
3. Implement `Feature<C>` in `src/features/<id>/` using only adapter selectors.
4. Unit + fixture tests green; axe clean; size budget green.
5. Canary assertion added.
6. Update docs and changelog; release with SRI; roll to canary, then real site.

## 6. Technical debt and platform improvements to schedule

| Item | When | Why |
|------|------|-----|
| Cloudflare Access or passkeys instead of static token | R3 | Stronger auth |
| Config history UI (rollback from panel) | R2 | Safety net |
| Import/export config JSON | R2 | Backup, move between sites |
| Sampled error beacon + dashboard | R3 | Know about breakage before visitors do |
| Per-page overrides | R3 | Different settings on different pages |
| Staged rollout channels (stable/canary tag) | R4 | Safer upgrades |
| Squarespace change monitor (diff of canary DOM snapshot) | R3 | Early warning beyond failing tests |

## 7. Honest cost-benefit check

Spark Plugin costs roughly the price of a coffee or two per month, according to third-party reviews (verify current pricing). Building and maintaining your own is a real time investment, and the ongoing cost is the update-chasing described in the research doc. It is a good choice when you want to **learn, own it, and use only a handful of features**. If you later find you need 30+ features, re-evaluate. Set a checkpoint after R2: if maintenance is eating more time than it saves, reconsider.
