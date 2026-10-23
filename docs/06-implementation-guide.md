# 06 - Implementation Guide

How to actually start. Written for you and for an AI coding agent (Antigravity).

## 1. Accounts and prerequisites

| Need | Why | Cost |
|------|-----|------|
| Squarespace 7.1 site on **Core or higher** (your real site) | Code Injection | existing |
| Throwaway Squarespace **canary** site (trial) | Safe testing, nightly checks | trial / check terms |
| GitHub account with 2FA | Repo, CI, release tags, jsDelivr source | free |
| Cloudflare account with 2FA | Worker + KV (+ optional Pages/R2) | free tier |
| Node.js LTS + npm | Build and test | free |
| Antigravity (you have it) | AI-assisted development | existing |

## 2. Project bootstrap (commands)

```bash
mkdir sitekit && cd sitekit
git init
npm init -y
npm i -D typescript esbuild vitest jsdom @playwright/test eslint prettier size-limit @size-limit/file \
         wrangler @axe-core/playwright
npm i preact          # editor only
npx tsc --init --strict
npx playwright install
```

Suggested `package.json` scripts:

```json
{
  "scripts": {
    "dev": "node scripts/build.mjs --watch",
    "build": "node scripts/build.mjs",
    "lint": "eslint src worker tests",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test tests/e2e/fixtures.spec.ts",
    "test:canary": "playwright test tests/e2e/canary.spec.ts",
    "size": "size-limit",
    "ci": "npm run lint && npm run typecheck && npm test && npm run build && npm run size && npm run test:e2e"
  }
}
```

Folder layout is in `03-architecture.md` section 7.

## 3. Build outputs (esbuild)

- `dist/sitekit.core.js` (IIFE, minified, target `es2020`)
- `dist/sitekit.editor.js` (IIFE, minified; Preact bundled)
- `dist/features/<id>.js` (one IIFE per feature that registers itself via `window.__SITEKIT__.register`)
- `dist/manifest.json` with sizes and SRI (`sha384`) for each file

Core loads feature chunks and the editor chunk **from the same base URL as itself** (derive from `document.currentScript.src`), so one pinned version means a consistent set of files.

## 4. Development loop on a real Squarespace site

`http://localhost` scripts are blocked on an https site (mixed content). Options, best first:

1. **Browser extension / userscript injector** (Tampermonkey-style): inject `https://localhost:PORT/dist/sitekit.core.js` only on your canary site, no Code Injection changes while developing.
2. **Local https** with `mkcert` and a dev server; add the tag to the canary site's Code Injection temporarily.
3. **Chrome DevTools Local Overrides** to swap the released file with your local build.

Never develop directly against your real site.

## 5. Squarespace set-up steps (once)

1. Settings > Advanced > Code Injection > Header (or Footer). Paste the script tag from `03-architecture.md` 2.1.
2. Confirm in DevTools: script loads, no errors, `window.__SITEKIT__` exists.
3. Fill `docs/verified-facts.md` (research doc section 10).
4. Know your escape hatch: add `/safe` after `/config` in the editor URL, or use "Disable Scripts in Preview". Test that it works **before** you need it.

## 6. Cloudflare set-up steps (once)

```bash
cd worker
npx wrangler login
npx wrangler kv namespace create KV           # copy the id into wrangler.toml
npx wrangler secret put ADMIN_TOKEN           # long random string (password manager)
npx wrangler deploy
```

`wrangler.toml`:

```toml
name = "sitekit-config"
main = "src/index.ts"
compatibility_date = "2026-10-01"
kv_namespaces = [{ binding = "KV", id = "PASTE_ID" }]
```

Worker responsibilities (see ADR-2): `GET /config.json` (cached), `PUT /config` (auth, validate, revision, store, purge). Keep the Worker under 200 lines.

## 7. Coding standards

- TypeScript `strict`, no `any` without a comment, no default exports in `src/`.
- No `eval`, `new Function`, `innerHTML` with dynamic data (lint rules enforce).
- All Squarespace selectors only in `src/adapters/squarespace.ts`. Mark non-spec ones `// UNSTABLE`.
- Each feature: `index.ts`, `schema.ts`, `styles.ts` (CSS as a function of config), tests. Idempotent `init`, complete `destroy`.
- Everything a feature adds carries `data-sk="<featureId>"`.
- Respect `prefers-reduced-motion`; keyboard accessible; visible focus.
- Small commits; Conventional Commits (`feat(backToTop): ...`); every commit references requirement IDs where relevant (`FR-BTT3`).
- No new dependency without a note in `docs/decisions.md` (size, license, maintenance).

## 8. Release procedure

1. `npm run ci` green locally.
2. Bump version, update `CHANGELOG.md`, tag `v1.0.1`, push tag.
3. GitHub Action builds, uploads `dist/` + `manifest.json` to the release.
4. Copy the SRI hash of `sitekit.core.js` from the manifest.
5. Update the canary site tag (`@1.0.1` + new `integrity`). Run the manual checklist (`04-test-plan.md` section 4).
6. Update the real site tag. Keep the previous tag text in your notes for instant rollback.

## 9. Operating the product

| Situation | Action |
|-----------|--------|
| Something looks broken on the live site | Set `disabled: true` via Publish (or visit with `?sitekit=off` to confirm it is us), then investigate |
| Can't use the Squarespace editor | `/config/safe` in the editor URL |
| Nightly canary failed | Open the auto-created issue; check which selector or probe failed; fix in the adapter; release patch |
| Token leaked or lost | `wrangler secret put ADMIN_TOKEN` with a new value |
| Squarespace announces a template/editor change | Run the manual checklist on the canary the same day |

## 10. Working with Antigravity

1. Put `AGENTS.md` in the repo root (provided). Also copy it to `.agent/rules/sitekit.md` and, if you like, `GEMINI.md`, because reports differ on which file each Antigravity version auto-loads. If it does not load automatically, start each session with "Read AGENTS.md and docs/ first".
2. Give the agent small tasks with clear acceptance criteria, one milestone item at a time. Review plans before letting it run commands.
3. Always make it write or update tests **before** implementing.

### Starter prompts (copy, paste, in order)

**Prompt 1: scaffold (M0)**
> Read AGENTS.md and everything in /docs. Implement Milestone M0 from docs/05-roadmap-and-next-updates.md. Create the repo structure from docs/03-architecture.md section 7, TypeScript strict config, esbuild build script producing core/editor/feature outputs plus manifest.json with SRI, ESLint with rules banning eval/new Function/innerHTML on dynamic data, Vitest, Playwright, size-limit with the budgets in NFR-1, and a GitHub Actions CI workflow. Do not implement features yet. Show me the plan first.

**Prompt 2: core runtime (R1 step 1)**
> Implement the core runtime per docs/03-architecture.md 2.2 and the Feature<C> interface in 2.3. Write unit tests for TC-C02 to TC-C08, TC-C10, TC-C11, TC-C15, TC-C16 first, then implement. Cache-first config, schema validation, kill switch, error boundary, mercury:load re-init. Keep core under 8 KB gzip.

**Prompt 3: Back to top feature**
> Port the back-to-top behaviour from the starter sitekit.js into src/features/backToTop following FR-BTT1..6. Add a schema, styles function and tests for TC-B01..B07, B09, B11, B13. It must be idempotent and clean up fully. Add minimum 44x44 px hit area and aria-hidden/tabindex handling when hidden.

**Prompt 4: editor**
> Build the editor entry (src/editor) with Preact inside a Shadow DOM per FR-E1..E11. Schema-driven controls, live preview via feature.update, draft persistence, drag with clamping, Esc to close, focus management, axe-clean. Detect the editor only through adapters/squarespace.ts. Write fixture tests for TC-E01..E14.

**Prompt 5: Worker**
> Implement worker/src/index.ts per docs/03-architecture.md 2.7: GET /config.json with Cache-Control and Cache API, PUT /config with bearer auth, schema validation, size limit, If-Match revision, revision history in KV, strict CORS for writes. Write tests TC-W01..W08 with a mocked KV.

**Prompt 6: canary**
> Create tests/e2e/canary.spec.ts and .github/workflows/canary.yml per TC-R01..R03: nightly run against CANARY_URL secret, assert the Squarespace contract attributes exist, no console errors from SiteKit, enabled features visible, and open a GitHub issue with a screenshot on failure.

## 11. Definition of Done (every task)

- [ ] Requirement IDs referenced
- [ ] Tests written first and passing (unit + fixture)
- [ ] Lint, typecheck, size budgets green
- [ ] No new Squarespace selector outside the adapter
- [ ] Accessibility checked (keyboard, axe)
- [ ] Docs updated (changelog, test plan rows, decisions)
