# Suggested Documentation Improvements & Change Requests

This document tracks ambiguities, inconsistencies, and suggested updates identified in `/docs`.
Existing files in `/docs` remain untouched per project phase rules.

---

### CR-01: Standardize Data Attribute Marker
- **Source Documents:** `AGENTS.md` Rule 4 vs `03-architecture.md` §2.2 vs starter `sitekit.js`.
- **Observation:** `AGENTS.md` specifies `data-sk="<id>"` (e.g. `data-sk="backToTop"`), whereas prototype `sitekit.js` used `data-sitekit="back-to-top"`, and `03-architecture.md` mentioned `<style data-sitekit>`.
- **Recommendation:** Standardize all DOM attributes, style tags, and query selectors on `data-sk="..."` (e.g. `data-sk="core"`, `data-sk="backToTop"`).

---

### CR-02: Finalize Config Read Path (Option A vs Option B)
- **Source Documents:** `03-architecture.md` §2.7 and ADR-2 vs `06-implementation-guide.md` Prompt 5.
- **Observation:** ADR-2 presents Option A (Worker with Cache API) and Option B (CI publishes static JSON to CDN/Pages/R2). The prototype `worker.js` performed direct KV reads on every request.
- **Recommendation:** Affirm Option A for Release 1 (Worker serving KV with Cache API headers) to keep infrastructure simple and within free-tier limits.

---

### CR-03: Editor Preview Iframe Detection
- **Source Documents:** `01-research-findings.md` §10.5 vs `03-architecture.md` §2.5.
- **Observation:** If Squarespace embeds the editor preview in an iframe (`#sqs-site-frame`), `document.body` in the top window may differ from the preview frame.
- **Recommendation:** Account for potential iframe environments in `detectEditor()` once verified on the canary site.

