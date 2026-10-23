# SiteKit documentation

A self-owned Squarespace 7.1 design toolkit: injected script + in-editor control panel + small config backend.

## Read in this order

| # | Document | Answers |
|---|----------|---------|
| 01 | [Research findings](01-research-findings.md) | What Squarespace allows, what Spark Plugin publicly does, what is verified vs inferred |
| 02 | [Product brief and requirements](02-product-brief-prd.md) | Goals, non-goals, requirement IDs, risks, success criteria |
| 03 | [Architecture](03-architecture.md) | Components, flows, data model, security, ADRs, repo layout |
| 04 | [Test plan and test cases](04-test-plan.md) | Strategy, 73 test cases with IDs, release checklist |
| 05 | [Roadmap and next updates](05-roadmap-and-next-updates.md) | Releases, feature catalog with effort/risk, how to pick the next feature |
| 06 | [Implementation guide](06-implementation-guide.md) | Setup, standards, release procedure, Antigravity prompts |
| - | [`../AGENTS.md`](../AGENTS.md) | Rules for the AI coding agent |

## Starter code

`../sitekit.js` and `../worker.js` are the working prototype from earlier in the conversation. They are a **reference for M0**, not the final structure. The editor check in `sitekit.js` now uses `body.sqs-edit-mode`.

## First three actions

1. Create the canary Squarespace site and answer the open questions in `01-research-findings.md` section 10 (write answers to `docs/verified-facts.md`).
2. Create the GitHub repo, copy this folder in, and give Antigravity **Prompt 1** from `06-implementation-guide.md`.
3. Do not start feature work until Milestone M0 and the canary are green.

## Status of the information

Research was done on 23 Oct 2026 from public sources. Squarespace changes often; re-check plan names, pricing and any `body` class names before relying on them. Items marked [Inferred] are reasoning, not fact.
