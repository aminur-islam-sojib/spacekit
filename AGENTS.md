# AGENTS.md - SiteKit project rules

SiteKit is a personal toolkit for a Squarespace 7.1 site, delivered as a script injected through Squarespace Code Injection, with an in-editor control panel and a small Cloudflare Worker backend.

**Before doing anything, read `/docs` in this order:** `01-research-findings.md`, `02-product-brief-prd.md`, `03-architecture.md`, `04-test-plan.md`, `05-roadmap-and-next-updates.md`, `06-implementation-guide.md`, and `docs/verified-facts.md` if it exists. Those documents are the source of truth. If code and docs disagree, stop and ask.

## Non-negotiable rules

1. **Never copy, decompile, deobfuscate or imitate Spark Plugin's (or any vendor's) code, assets or branding.** Build from the docs and from Squarespace's public documentation only.
2. **All Squarespace-specific selectors live in `src/adapters/squarespace.ts`.** Prefer attributes from Squarespace's Custom Code Specification (`data-sqsp-section`, `data-sqsp-block`, `data-sqsp-*`). Anything else must be marked `// UNSTABLE` and have a fallback and a test.
3. **Visitors must never download the editor.** The editor is a separate file loaded only when the editor is detected.
4. **Features implement `Feature<C>`** (`init`, `update`, `destroy`, `probe`), are idempotent, tag everything they add with `data-sk="<id>"`, and clean up fully.
5. **One failing feature must never break others or the page.** Wrap lifecycle calls in try/catch; log with feature id.
6. **Security:** no `eval`, no `new Function`, no `innerHTML` with dynamic data, validate all config against the schema (client and Worker), never put secrets in the public snippet, pin versions and use SRI.
7. **Respect `prefers-reduced-motion`**, keyboard access, visible focus, 44 px touch targets.
8. **Never break the Squarespace editor:** no global key/mouse handlers except Esc while the panel is open; do not modify Squarespace's editor DOM.
9. **Budgets:** core <= 8 KB gzip, each feature <= 5 KB gzip. Do not add dependencies without a note in `docs/decisions.md`.
10. **Tests first.** Write or update test cases (IDs from `04-test-plan.md`) before implementing. A task is not done until lint, typecheck, tests and size budgets pass.

## Working style

- Work on **one roadmap item at a time**. Show a short plan before running commands or editing many files.
- Ask when a Squarespace behaviour is unverified; add the question to `docs/verified-facts.md` instead of guessing.
- Reference requirement IDs (e.g. `FR-BTT3`, `TC-C06`) in commits and PR descriptions. Use Conventional Commits.
- Keep the Worker small and boring. Keep the core smaller.
- Do not add features outside the current milestone.

## Tech stack

TypeScript (strict), esbuild, Preact (editor only), Vitest + jsdom, Playwright, axe-core, size-limit, Cloudflare Workers + KV, GitHub Actions, jsDelivr delivery from tagged releases.

## Commands

`npm run dev` | `npm run build` | `npm test` | `npm run test:e2e` | `npm run test:canary` | `npm run size` | `npm run ci`
