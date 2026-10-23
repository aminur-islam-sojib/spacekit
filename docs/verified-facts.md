# Verified Facts

This file records empirical, verified observations from the real Squarespace site and the canary test site.
It is the project's ground truth. Do not make assumptions when a fact can be verified in DevTools.

Last updated: (Pending verification on canary site)

---

## 1. Template & Page Loading (Research Findings §10.1)

- **Question:** Does your template use AJAX loading? (In DevTools, navigate between pages and check if `<body>` is replaced or if a full page reload occurs).
- **Status:** Pending verification.
- **Observed Behavior:**
- **Implication:** If AJAX is active, features must listen for `mercury:load` window events and maintain strict idempotency.

---

## 2. Editor Detection Hook (Research Findings §10.2)

- **Question:** Does `body.sqs-edit-mode` appear in your editor preview? On which element, and at what point in the lifecycle?
- **Status:** Verified on live Squarespace 7.1 site (`mustard-gerbil-bdhc.squarespace.com`).
- **Observed Behavior:** Inside `https://*.squarespace.com/config/`, `document.body.className` contains `squarespace-config squarespace-editable sqs-frame-loaded`. The legacy class `sqs-edit-mode` was NOT present on `<body>`.
- **Implication:** `detectEditor()` in `src/adapters/squarespace.ts` must check for `squarespace-config`, `squarespace-editable`, and `location.pathname.startsWith('/config')` in addition to `sqs-edit-mode`.

---

## 3. Custom Code Specification Attribute Presence (Research Findings §10.3)

- **Question:** Do blocks in your Fluid Engine sections carry `data-sqsp-block` and sections carry `data-sqsp-section` as documented in the Custom Code Specification?
- **Status:** Pending verification.
- **Observed Behavior:**
- **Implication:** Validates whether the selector contract in `src/adapters/squarespace.ts` matches live markup.

---

## 4. Plan & Code Injection Support (Research Findings §10.4)

- **Question:** Is the site on Core, Plus, Advanced or legacy Business plan, and is Code Injection accessible under Settings > Advanced?
- **Status:** Verified.
- **Observed Behavior:** Injected `<script>` tags load and execute successfully on the live site and in the `/config/` admin interface.
- **Implication:** Confirms Code Injection executes reliably across visitor and editor sessions.

---

## 5. Editor Preview Frame Context (Research Findings §10.5)

- **Question:** Is the editor preview rendered inside an `<iframe>` (e.g. `#sqs-site-frame`) or in the top-level document?
- **Status:** Verified on live Squarespace 7.1 site.
- **Observed Behavior:** The user ran `inIframe: window.parent !== window` at `https://*.squarespace.com/config/` and it evaluated to `false` in the main editor window where the injected script was executing.
- **Implication:** The Shadow DOM host `#sitekit-host` can mount directly to `document.body` in the top document.

