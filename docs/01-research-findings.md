# 01 - Research Findings

Research date: 23 Oct 2026. Every claim is tagged with how much to trust it:

- **[Official]** stated by Squarespace or the vendor on their own pages
- **[Community]** reported by Squarespace developers/forum/tutorials, not guaranteed by Squarespace
- **[Third-party]** reported by a review or comparison site
- **[Inferred]** our reasoning from the evidence. Must be verified before relying on it

---

## 1. How Squarespace allows custom code

| # | Finding | Tag | Source |
|---|---------|-----|--------|
| 1.1 | Code injection (site-wide header/footer, per-page header, blog post item, lock page, order confirmation/status) is available on **Core, Plus, Advanced and some legacy plans**. Not on Basic. (Older articles say "Business"; that plan name is outdated.) | Official | support.squarespace.com/hc/en-us/articles/205815908 |
| 1.2 | **Checkout pages do not support code.** | Official | same |
| 1.3 | Squarespace does not provide support for code-based modifications. If your code breaks something, you own it. | Official | support.squarespace.com (Code-based customizations) |
| 1.4 | Scripts can be disabled in the editor with **"Disable Scripts in Preview"** or by adding `/safe` after `/config` in the editor URL. This is the built-in escape hatch if your code breaks the editor. | Official | support.squarespace.com/hc/en-us/articles/205815908 |
| 1.5 | The Squarespace **Developer Platform** (template-level development) is **7.0 only**. Not usable for 7.1 sites. | Official | support.squarespace.com/hc/en-us/articles/205815928 |
| 1.6 | Squarespace has an OAuth-based third-party app/extension system (self-service developer apps page; `extension.uninstall` webhook exists). It is aimed at commerce/API integrations, not at injecting design scripts. | Official | developers.squarespace.com, support page banner |
| 1.7 | Prices in 2026 vary between sources (plan lineup and prices are shifting). **Always check the live pricing page** before deciding on a plan. | Third-party | multiple |

**Consequence:** the only supported way to ship a "plugin" for a 7.1 site is **a script (and CSS) injected through Code Injection**. No marketplace approval is needed, but there is no vendor support and no guarantees.

## 2. The DOM contract (the most important finding)

Squarespace publishes a **Custom Code Specification**: "a set of persistent HTML and CSS properties that you can rely on" when adding custom code. They state that anything outside it (HTML attributes, DOM structure, CSS selectors, CSS variables, JS variables) is **more likely to change** and break custom code. [Official] (developers.squarespace.com/custom-code/about)

What the spec currently guarantees (developers.squarespace.com/custom-code/html) [Official]:

- Section wrapper: `data-sqsp-section="{type}"` with types including `fluid-engine`, `classic-editor`, `auto-layout`, `gallery`, `blog-list`, `blog-item`, `product-list`, `product-detail`, and more.
- Block wrapper: `data-sqsp-block="{type}"` with types including `text`, `button`, `image` (Fluid Engine), `image-classic`, `shape`, `form`, `code`, `embed`, `quote`, `summary`, `video`, `social-links`, `search`, `gallery`, `line`, `accordion`, `newsletter`, `markdown`, and more.
- Inner hooks: `data-sqsp-button`, `data-sqsp-text-block-content`, `data-sqsp-image-block-image`, `data-sqsp-image-block-link`, `data-sqsp-image-block-lightbox-button`, `data-sqsp-shape-block-shape`, accordion item hooks, and others.
- Section `id` is persistent **only** when it is an anchor-link slug a human created in the editor. Auto-generated ids may change.

What the spec does **not** cover, but everyone uses [Community]:

- `section[data-section-id="..."]` (section identity) and `#block-yui_...` / block ids (block identity). Widely used by tutorials and ID-finder extensions.
- `body.sqs-edit-mode` (set while you are in the site backend) and `body.sqs-edit-mode-active` (set only while actively editing a page). Sources: forum.squarespace.com/topic/222618, beatrizcaraballo.com.
- `data-section-id` is replaced when a Classic Editor section is converted to Fluid Engine, which breaks code that targeted it. [Community] (will-myers.com)

**Consequence for design:** build features on spec attributes wherever possible; put every non-spec selector behind one adapter file so a Squarespace change is a one-file fix.

## 3. Page loading behaviour

- Header/footer injected scripts run **once** per full page load.
- Some Squarespace templates load pages with AJAX. Scripts must re-run on the `mercury:load` window event as well as on `DOMContentLoaded`. [Community] (Marketo, StoreRocket, other vendor docs)
- AJAX loading is documented mostly for 7.0 template families (Brine, Farro, Tremont, York). Whether your 7.1 site uses it must be **tested on the actual site**. [Inferred]

**Consequence:** every feature must be idempotent: `init()` can be called many times and `destroy()` must fully clean up.

## 4. Spark Plugin: what is publicly known

From sparkplugin.com and independent reviews. We have **not** read or decompiled their code, and our design does not depend on doing so.

| # | Finding | Tag |
|---|---------|-----|
| 4.1 | Install = sign up, receive a snippet, paste it into Squarespace Code Injection. Nothing else to install. | Official |
| 4.2 | After install, a control panel appears inside the Squarespace editor (top-right). You click a block, change settings, and see changes live. | Official / Third-party |
| 4.3 | 100+ customizations in categories (content, motion, design, marketing); new feature roughly monthly. | Official |
| 4.4 | Claims: edits are hosted "on your site", adapt to Squarespace updates, work on all browsers and mobile. Not supported: Squarespace 7.0 templates and the Personal plan. | Official |
| 4.5 | Customizations are CSS-driven where possible, so reviewers report no noticeable slowdown. | Third-party |
| 4.6 | Customizations stop applying when a subscription is cancelled (a competitor, SquareKicker, is reported to keep them). This implies a **license check at runtime**. | Third-party |
| 4.7 | A separate dashboard app (dashboard.sparkplugin.com) handles sign-up, install code and subscription. Three pricing tiers (personal, business, designer/agency). | Official / Third-party |
| 4.8 | The panel can be used without being in an active page-edit session. | Third-party |

### Likely architecture (all [Inferred], consistent with 4.1-4.8)

1. A small loader snippet in Code Injection pointing to a per-site URL on their CDN.
2. A runtime that fetches the site's config + license status, applies CSS/JS per enabled feature.
3. An editor overlay loaded only when the editor is detected.
4. Per-block settings keyed by block/section identity.
5. A maintenance process (tests + monitoring) that catches Squarespace markup changes. This is what customers actually pay for.

## 5. Competitive landscape

| Product | Model | Note |
|---------|-------|------|
| Spark Plugin | Subscription, curated one-click features | Easiest to use |
| SquareKicker | Subscription, granular control panel | More control, harder to learn |
| Elfsight | Widgets managed on Elfsight's site | Cross-platform; settings live outside Squarespace |
| Free snippet libraries (blogs, GitHub gists) | Copy/paste | No UI; break silently on updates |

**Differentiator for our tool (personal use):** none needed. The goal is a tool you own and understand. The professional discipline is in update-resilience and safety, not in features.

## 6. Hosting limits that shape the backend (Cloudflare)

[Official] developers.cloudflare.com/kv/platform/limits and /pricing:

- Workers KV free plan: 100,000 reads/day, **1,000 writes/day**, 1 write per second per key, values up to 25 MiB, minimum edge cache TTL 30 s.
- KV is eventually consistent (changes can take up to about a minute to show everywhere). [Third-party / Official docs]
- Workers free plan: 100,000 requests/day. [Third-party; verify on cloudflare.com]

**Consequence:** do not call a Worker on every visitor page view. Publish the config as a **cached static JSON** and use the Worker only for authenticated writes (see architecture doc).

## 7. Tooling note: Antigravity

- Project instructions can go in `AGENTS.md` (cross-tool) or `GEMINI.md`; workspace rules and workflows can also live under `.agent/rules/` and `.agent/workflows/`. Reports conflict on whether older Antigravity versions auto-load `AGENTS.md`; a March 2026 release reportedly added it. [Third-party]
- **Safe approach:** keep `AGENTS.md` in the repo root and also copy it to `.agent/rules/sitekit.md`.

## 8. Legal and ethical position

- Build from public documentation and your own code. Do **not** copy, decompile or deobfuscate Spark Plugin's code, assets, copy or branding. It is proprietary and the result would be a fragile fork.
- Personal use on your own site is low risk. If you ever sell this, get legal advice on Squarespace's terms, trademark use of the word "Squarespace", privacy (GDPR) for any analytics, and licensing of bundled libraries (GSAP's license differs from MIT; check before bundling).

## 9. Corrections to earlier guidance in this conversation

- Plan name: use **Core or higher** (not "Business").
- Editor detection: use `body.sqs-edit-mode` (now in `sitekit.js`), not the iframe check.
- A Worker + KV `GET` on every page view is a bad pattern at scale (see section 6). The improved design is in `03-architecture.md`.

## 10. Open questions to verify on your own site (before coding too much)

1. Does your template use AJAX loading? (Open DevTools, navigate between pages, watch whether the `<body>` is replaced or the page fully reloads.)
2. Does `body.sqs-edit-mode` appear in your editor preview? On which element, and when?
3. Do blocks in your Fluid Engine sections carry `data-sqsp-block` as the spec says?
4. Is your plan Core or higher, and is code injection visible in Settings > Advanced?
5. Is the editor preview an iframe or the same document? (Affects where the panel mounts.)

Record the answers in `docs/verified-facts.md` as you go. That file is the project's ground truth.
